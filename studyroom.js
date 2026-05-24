// ✅ PART 1: INITIALIZATION & AUTH
// ==================================

let youtubePlayer = null;
let youtubeApiReady = false;

// Load YouTube API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
  youtubeApiReady = true;
  console.log('✅ YouTube API Ready');
};
const API_URL = window.API_URL || (window.location.origin + '/api');
const socketBase = window.API_BASE || window.location.origin;

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');

if (!roomId) {
  alert('Invalid room link');
  window.location.href = '/html/study.html';
}

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || !user.username) {
  alert('Please login first');
  window.location.href = '/html/login.html';
}

const socket = io(socketBase);
console.log('✅ Initialized - Room:', roomId, 'User:', user.username);


// ✅ PART 2: STATE MANAGEMENT (IN-MEMORY ONLY)
// =============================================

let isMuted = false;
let isScreenSharing = false;
let isOnBreak = false;
let breakTimer = null;
let liveTaskId = null;

// Real-time data (server-synced)
const userTimers = new Map(); // userId -> { startTime, pausedDuration, isPaused }
let isTabVisible = true;
let cachedTasks = [];
let chatHistory = [];
let cachedParticipants = []; // ✅ CACHE PARTICIPANTS
let lastTaskListHTML = "";
let isProcessingMessage = false;

// ✅ TIMERS FOR AUTO-REFRESH
let participantsRefreshInterval = null;
let tasksRefreshInterval = null;


// ✅ PART 3: SOCKET CONNECTION
// ============================

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  
  socket.emit('join-room', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username,
    avatar: user.username.charAt(0).toUpperCase(),
    email: user.email || ''
  });
});

socket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});


// ✅ PART 4: SOCKET LISTENERS - PARTICIPANTS (REAL-TIME)
// ======================================================

// Listen for participant updates from server (every 1 second)
socket.on('participants-list-update', ({ participants, roomId: updatedRoomId }) => {
  if (updatedRoomId !== roomId) return;
  
  console.log('👥 Participants update:', participants.length);
  
  // 🔥 FIX 6: CACHE participants BEFORE rendering
  // This ensures calculateTimeInRoom() has fresh data
  cachedParticipants = participants.filter(p => p.isActive);
  
  // Only re-render if count changed or participants changed
  const countBefore = document.getElementById('participantsCount').textContent;
  if (countBefore !== cachedParticipants.length.toString()) {
    renderParticipants(cachedParticipants);
  }
});
// When someone joins
socket.on('user-joined', ({ userId, username, participants }) => {
  console.log(`✅ ${username} joined`);
  cachedParticipants = participants.filter(p => p.isActive);
  renderParticipants(cachedParticipants);
  addChatMessage('System', `${username} joined the room`, 'system');
});

// When someone leaves
socket.on('user-left', ({ userId, username, participants }) => {
  console.log(`❌ ${username} left`);
  cachedParticipants = participants.filter(p => p.isActive);
  renderParticipants(cachedParticipants);
  addChatMessage('System', `${username} left the room`, 'system');
});

// Status updates
socket.on('user-status-update', ({ participants, statusMessage }) => {
  cachedParticipants = participants.filter(p => p.isActive);
  renderParticipants(cachedParticipants);
  if (statusMessage) {
    addChatMessage('System', statusMessage, 'system');
  }
});

// When task is started, emit task progress update
async function emitTaskProgress() {
  try {
    // Use cached tasks instead of fetching again to avoid timing issues
    if (!cachedTasks || !Array.isArray(cachedTasks)) {
      console.warn('⚠️ No cached tasks available for progress calculation');
      return;
    }
    
    // Calculate actual totals from cached tasks
    const totalCount = cachedTasks.reduce((sum, task) => sum + (task.subTasks?.length || 0), 0);
    const completedCount = cachedTasks.reduce((sum, task) => 
      sum + (task.subTasks?.filter(s => s.completed).length || 0), 0
    );
    
    console.log(`📊 Emitting task progress: ${completedCount}/${totalCount}`);
    
    // 🔥 Emit task progress to server
    socket.emit('task-progress-update', {
      roomId: roomId,
      userId: user.id || user._id,
      username: user.username,
      tasksCompleted: completedCount,
      totalTasks: totalCount
    });
    
    console.log(`✅ Emitted progress to server`);
    
  } catch (error) {
    console.error('❌ Error emitting task progress:', error);
  }
}
// 🔥 PART 2: Listen for task progress updates from other users
// ===========================================================

socket.on('task-progress-update', async ({ roomId, userId, username, tasksCompleted, totalTasks }) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;
    
    const participant = room.participants.find(p => p.userId.toString() === userId);
    if (participant) {
      participant.tasksCompleted = tasksCompleted;
      participant.totalTasks = totalTasks;
      
      await room.save();
      
      console.log(`📊 ${username}: ${tasksCompleted}/${totalTasks}`);
    }
    
    // 🔥 Broadcast to all participants in room
    io.to(roomId).emit('participant-task-progress', {
      userId,
      username,
      tasksCompleted,
      totalTasks
    });
    
  } catch (error) {
    console.error('Task progress update error:', error);
  }
});


// ✅ PART 5: SOCKET LISTENERS - TIMER UPDATES (KEY FIX)
// ===================================================

// Server sends timer data every second
socket.on('room-timers-update', ({ timers, roomId: updatedRoomId }) => {
  if (updatedRoomId !== roomId) return;
  
  // Update local timer data from server
  Object.entries(timers).forEach(([userId, timerData]) => {
    userTimers.set(userId, timerData);
  });
  
  // Update display (efficient - only badges)
  updateTimerBadges();
});


// ✅ PART 6: SOCKET LISTENERS - CHAT
// ==================================

socket.on('chat-history', (messages) => {
  console.log('📚 Chat history loaded:', messages.length);
  chatHistory = messages;
  renderChatHistory();
});

socket.on('new-message', (messageData) => {
  if (messageData.userId.toString() === (user.id || user._id).toString()) {
    return; // Skip own messages
  }
  console.log(`💬 ${messageData.username}`);
  addChatMessageToDOM(messageData);
});


// ✅ PART 7: SOCKET LISTENERS - TASKS
// ==================================

socket.on('task-started', async () => {
  console.log('🎯 Task started');
  await loadTasks();
  emitTaskProgress(); // 🔥 Broadcast progress
});

socket.on('task-update', async () => {
  console.log('🔄 Task updated');
  await loadTasks();
  emitTaskProgress(); // 🔥 Broadcast progress
});


// ✅ PART 8: FETCH PARTICIPANTS ON PAGE LOAD
// ==========================================

async function fetchAndRenderParticipants() {
  try {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    if (!data.success) return;
    
    const activeParticipants = data.room.participants.filter(p => p.isActive);
    console.log('📥 Fetched participants:', activeParticipants.length);
    
    cachedParticipants = activeParticipants;
    renderParticipants(activeParticipants);
    
  } catch (error) {
    console.error('Error fetching participants:', error);
  }
}

// Load actual task data from API when initializing

let myTaskProgress = { totalTasks: 0, tasksCompleted: 0 };

async function loadUserTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to load tasks:', response.status);
      return null;
    }
    
    const tasks = await response.json();
    
    if (!Array.isArray(tasks)) {
      console.error('❌ Invalid tasks response:', tasks);
      return null;
    }
    
    // Calculate actual totals
    const totalCount = tasks.reduce((sum, task) => sum + (task.subTasks?.length || 0), 0);
    const completedCount = tasks.reduce((sum, task) => 
      sum + (task.subTasks?.filter(s => s.completed).length || 0), 0
    );
    
    console.log(`📊 User Tasks: ${completedCount}/${totalCount}`);
    
    myTaskProgress = {
      totalTasks: totalCount,
      tasksCompleted: completedCount
    };
    
    return myTaskProgress;
  } catch (error) {
    console.error('❌ Error loading user tasks:', error);
    return null;
  }
}

// 🔥 Load immediately on initialization
loadUserTasks().then(progress => {
  if (progress) {
    console.log('✅ Initial task load:', progress);
  }
});

// 🔥 Reload every 10 seconds (FIXED: don't chain .then to setInterval)
setInterval(() => {
  loadUserTasks();
}, 10000);

// ✅ PART 9: RENDER PARTICIPANTS WITH TIMERS
// =========================================

function renderParticipants(participants) {
  const list = document.getElementById('participantsList');
  const count = document.getElementById('participantsCount');
  
  if (!participants || !Array.isArray(participants)) {
    console.warn('Invalid participants data');
    return;
  }
  
  // Remove duplicates
  const seen = new Set();
  const unique = participants.filter(p => {
    const key = p.userId.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  count.textContent = unique.length;
  
  // Sort by time, then tasks
  const sorted = [...unique].sort((a, b) => {
    const aTimer = userTimers.get(a.userId.toString());
    const bTimer = userTimers.get(b.userId.toString());
    
    const aAccum = (a.totalAccumulatedTime || 0);
    const bAccum = (b.totalAccumulatedTime || 0);
    
    const aTime = a.hasActiveTask && aTimer && !aTimer.isPaused
      ? aAccum + (Date.now() - aTimer.startTime - (aTimer.pausedDuration || 0))
      : aAccum;
    
    const bTime = b.hasActiveTask && bTimer && !bTimer.isPaused
      ? bAccum + (Date.now() - bTimer.startTime - (bTimer.pausedDuration || 0))
      : bAccum;
    
    if (bTime !== aTime) return bTime - aTime;
    return (b.tasksCompleted || 0) - (a.tasksCompleted || 0);
  });
  
  // Render HTML
  list.innerHTML = sorted.map((p, index) => {
    // Initialize timer if needed
    if (p.hasActiveTask && !userTimers.has(p.userId.toString())) {
      initializeTimer(p.userId.toString(), p.joinedAt);
    }
    
    const timerData = userTimers.get(p.userId.toString());
    const timeInRoom = timerData ? calculateTimeInRoom(timerData, p) : '0s';
    
    // 🔥 FIX: Get actual task progress
    let tasksCompleted = 0;
    let totalTasks = 0;
    
    // If this is current user, use loaded data
    const currentUserId = user.id || user._id;
    if (p.userId.toString() === currentUserId.toString()) {
      tasksCompleted = myTaskProgress.tasksCompleted || 0;
      totalTasks = myTaskProgress.totalTasks || 0;
    } else {
      // For other users, use their data (if available from server)
      tasksCompleted = p.tasksCompleted || 0;
      totalTasks = p.totalTasks || 0;
    }
    
    // 🔥 Handle zero tasks - don't fake it as 1
    if (totalTasks === 0) {
      // Keep as 0/0 - progress will be updated when user sends task update
      tasksCompleted = 0;
    }
    
    const progressPercent = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
    
    // Status
    let statusIcon = '📚';
    let statusColor = 'background: #10b981;';
    
    if (p.status === 'break') {
      statusIcon = '☕';
      statusColor = 'background: #f59e0b;';
    } else if (p.status === 'urgent') {
      statusIcon = '🚨';
      statusColor = 'background: #ef4444;';
    } else if (p.isMuted) {
      statusIcon = '🔇';
      statusColor = 'background: #6b7280;';
    }
    
    const rankBadge = index < 3 ? `<span class="rank-badge rank-${index + 1}">#${index + 1}</span>` : '';
    
    return `
      <div class="participant" data-user-id="${p.userId}">
        <div class="participant-avatar-container">
          <div class="progress-wrapper">
            <svg class="progress-ring" width="50" height="50">
              <circle class="progress-ring-bg" cx="25" cy="25" r="22"/>
              <circle class="progress-ring-fill" cx="25" cy="25" r="22"
                style="stroke-dasharray: 138; stroke-dashoffset: ${138 - (138 * progressPercent / 100)}"/>
            </svg>
            <span class="task-progress-badge">${tasksCompleted}/${totalTasks}</span>
          </div>
          <div class="participant-avatar">${p.avatar}</div>
        </div>
        
        <div class="participant-info">
          <div class="participant-name">
            ${rankBadge}
            ${p.username}
            <span class="timer-badge" data-user-id="${p.userId}" style="font-size: 12px; color: #94a3b8;">${timeInRoom}</span>
          </div>
        </div>
        
        <div class="participant-status" style="${statusColor}">
          ${statusIcon}
        </div>
      </div>
    `;
  }).join('');
}
// ✅ NEW: Include accumulated time

function calculateTimeInRoom(timerData, participant) {
  if (!timerData || !participant) return '0s';
  
  // 🔥 FIX 1: Check totalAccumulatedTime FIRST (not hasActiveTask)
  // This prevents flickering between "14m 41s" and "—"
  
  const accumulatedTime = participant.totalAccumulatedTime || 0;
  
  // If task is NOT running (paused or never started)
  if (!participant.hasActiveTask || timerData.isPaused) {
    // Show accumulated time (frozen)
    const totalSeconds = Math.floor(accumulatedTime / 1000);
    return formatTime(totalSeconds);
  }
  
  // If task IS running
  if (participant.hasActiveTask && timerData.startTime) {
    const now = Date.now();
    const currentSessionMs = now - timerData.startTime - (timerData.pausedDuration || 0);
    const totalMs = accumulatedTime + currentSessionMs;
    const totalSeconds = Math.floor(totalMs / 1000);
    return formatTime(totalSeconds);
  }
  
  // Fallback: show accumulated only
  const totalSeconds = Math.floor(accumulatedTime / 1000);
  return formatTime(totalSeconds);
}

function initializeTimer(userId, joinedAt) {
  if (!userTimers.has(userId)) {
    userTimers.set(userId, {
      startTime: new Date(joinedAt).getTime(),
      pausedDuration: 0,
      isPaused: true
    });
  }
}
// ✅ EFFICIENT TIMER BADGE UPDATE (NO FULL RE-RENDER)
// ==================================================


function updateTimerBadges() {
  document.querySelectorAll('.timer-badge').forEach(badge => {
    const userId = badge.dataset.userId;
    
    // 🔥 FIX 4: Get participant data to check hasActiveTask
    const participant = cachedParticipants.find(p => p.userId.toString() === userId);
    const timerData = userTimers.get(userId);
    
    if (!participant || !timerData) {
      badge.textContent = '0s';
      return;
    }
    
    // 🔥 CRITICAL: Only update if task is ACTIVELY RUNNING
    if (participant.hasActiveTask && !timerData.isPaused) {
      // Calculate current time with accumulated
      const accum = participant.totalAccumulatedTime || 0;
      const current = Date.now() - timerData.startTime - (timerData.pausedDuration || 0);
      const totalSeconds = Math.floor((accum + current) / 1000);
      badge.textContent = formatTime(totalSeconds);
    } else {
      // 🔥 FIX 5: When paused, show ACCUMULATED TIME (frozen, no flicker)
      const accum = participant.totalAccumulatedTime || 0;
      const totalSeconds = Math.floor(accum / 1000);
      badge.textContent = formatTime(totalSeconds);
    }
  });
}

function formatTime(seconds) {
  if (seconds < 0) seconds = 0; // 🔥 FIX: Prevent negative times
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
// ✅ PART 10: BREAK MANAGEMENT
// ===========================

function openBreakModal() {
  document.getElementById('breakModal').style.display = 'flex';
}

function closeBreakModal() {
  document.getElementById('breakModal').style.display = 'none';
}

function takeBreak(duration) {
  closeBreakModal();
  isOnBreak = true;
  
  // Pause timer
  const myTimer = userTimers.get(user.id || user._id);
  if (myTimer) {
    myTimer.isPaused = true;
  }
  
  let breakMessage = '';
  if (duration === 'urgent') {
    breakMessage = `${user.username} is handling urgent work 🚨`;
  } else {
    breakMessage = `${user.username} is taking a ${duration} min break ☕`;
    breakTimer = setTimeout(() => {
      endBreak();
    }, duration * 60 * 1000);
  }
  
  const breakBtn = document.getElementById('breakBtn');
  breakBtn.textContent = '⏸️ On Break';
  breakBtn.style.background = '#f59e0b';
  
  addChatMessage('System', breakMessage, 'system');
  
  socket.emit('status-update', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username,
    status: duration === 'urgent' ? 'urgent' : 'break',
    statusMessage: breakMessage
  });
}

function endBreak() {
  isOnBreak = false;
  
  if (breakTimer) {
    clearTimeout(breakTimer);
    breakTimer = null;
  }
  
  // Resume timer
  const myTimer = userTimers.get(user.id || user._id);
  if (myTimer) {
    myTimer.isPaused = false;
  }
  
  const breakBtn = document.getElementById('breakBtn');
  breakBtn.textContent = '☕ Take Break';
  breakBtn.style.background = '';
  
  const returnMessage = `${user.username} returned from break 📚`;
  addChatMessage('System', returnMessage, 'system');
  
  socket.emit('status-update', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username,
    status: 'studying',
    statusMessage: returnMessage
  });
}


// ✅ PART 11: MUTE & SCREEN SHARE
// ==============================

function toggleMute() {
  isMuted = !isMuted;
  
  const muteIcon = document.getElementById('muteIcon');
  const muteText = document.getElementById('muteText');
  const muteBtn = document.getElementById('muteBtn');
  
  if (isMuted) {
    muteIcon.textContent = '🔈';
    muteText.textContent = 'Unmute';
    muteBtn.style.background = '#6b7280';
  } else {
    muteIcon.textContent = '🔇';
    muteText.textContent = 'Mute';
    muteBtn.style.background = '';
  }
  
  socket.emit('status-update', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username,
    isMuted: isMuted
  });
}

async function toggleScreenShare() {
  if (!isScreenSharing) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      isScreenSharing = true;
      
      const shareIcon = document.getElementById('shareIcon');
      const shareText = document.getElementById('shareText');
      const shareBtn = document.getElementById('screenShareBtn');
      
      shareIcon.textContent = '📹';
      shareText.textContent = 'Stop Screen Share';
      shareBtn.style.background = '#10b981';
      
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      socket.emit('screen-share-start', {
        roomId: roomId,
        userId: user.id || user._id,
        username: user.username
      });
      
      addChatMessage('System', `${user.username} started screen sharing 🖥️`, 'system');
      
    } catch (error) {
      console.error('Screen share error:', error);
    }
  } else {
    stopScreenShare();
  }
}

function stopScreenShare() {
  isScreenSharing = false;
  
  const shareIcon = document.getElementById('shareIcon');
  const shareText = document.getElementById('shareText');
  const shareBtn = document.getElementById('screenShareBtn');
  
  shareIcon.textContent = '📷';
  shareText.textContent = 'Start Screen Share';
  shareBtn.style.background = '';
  
  socket.emit('screen-share-stop', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username
  });
  
  addChatMessage('System', `${user.username} stopped screen sharing`, 'system');
}


// ✅ PART 12: CHAT MANAGEMENT
// ===========================

function renderChatHistory() {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';
  
  chatHistory.forEach(msg => {
    addChatMessageToDOM(msg);
  });
}

function addChatMessage(username, message, type = 'user') {
  const isDuplicate = chatHistory.some(msg => 
    msg.username === username && 
    msg.message === message && 
    (Date.now() - new Date(msg.timestamp).getTime()) < 1000
  );
  
  if (isDuplicate) return;
  
  const messageData = {
    username,
    message,
    type,
    timestamp: new Date()
  };
  
  chatHistory.push(messageData);
  addChatMessageToDOM(messageData);
}

function addChatMessageToDOM(messageData) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${messageData.type}`;
  
  if (messageData.type === 'system') {
    messageDiv.innerHTML = `
      <div class="system-message">
        ${messageData.message}
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="chat-avatar">${messageData.username.charAt(0).toUpperCase()}</div>
      <div class="chat-content">
        <div class="chat-username">${messageData.username}</div>
        <div class="chat-text">${messageData.message}</div>
        <div class="chat-time">${new Date(messageData.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
    `;
  }
  
  chatMessages.appendChild(messageDiv);
  
  setTimeout(() => {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

function sendMessage() {
  if (isProcessingMessage) return;
  
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  isProcessingMessage = true;
  
  socket.emit('chat-message', {
    roomId: roomId,
    userId: user.id || user._id,
    username: user.username,
    message: message
  });
  
  addChatMessage(user.username, message, 'user');
  input.value = '';
  
  setTimeout(() => {
    isProcessingMessage = false;
  }, 500);
}

function handleChatInput(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}


// ✅ PART 13: TASKS MANAGEMENT
// ===========================


async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Unauthorized');
        window.location.href = '/html/login.html';
      }
      console.error('❌ Error loading tasks:', response.status);
      return;
    }
    
    const tasks = await response.json();
    
    if (!Array.isArray(tasks)) {
      console.error('❌ Invalid tasks response');
      return;
    }
    
    console.log('✅ Tasks loaded:', tasks.length);
    
    cachedTasks = tasks;
    
    // 🔥 Also update task progress
    const totalCount = tasks.reduce((sum, task) => sum + (task.subTasks?.length || 0), 0);
    const completedCount = tasks.reduce((sum, task) => 
      sum + (task.subTasks?.filter(s => s.completed).length || 0), 0
    );
    
    myTaskProgress = {
      totalTasks: totalCount,
      tasksCompleted: completedCount
    };
    
    renderTaskSummary(tasks);
    renderTaskList(tasks);
    
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
  }
}

function renderTaskSummary(tasks) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    document.getElementById('summaryText').textContent = 'No tasks yet';
    return;
  }
  
  const total = tasks.reduce((a, t) => a + (t.subTasks?.length || 0), 0);
  const done = tasks.reduce((a, t) => a + (t.subTasks?.filter(s => s.completed).length || 0), 0);
  const global = total ? Math.round(done / total * 100) : 0;
  
  document.getElementById('summaryText').textContent = `Overall: ${done}/${total} (${global}%)`;
}

function renderTaskList(tasks) {
  if (!tasks || !Array.isArray(tasks)) return;
  
  if (tasks.length === 0) {
    document.getElementById('list').innerHTML = `
      <div style="padding: 40px; text-align: center; color: #94a3b8;">
        <p>No tasks yet. Add one to get started!</p>
      </div>
    `;
    return;
  }
  
  tasks.sort((a, b) => {
    const aDone = a.subTasks?.every(s => s.completed) || false;
    const bDone = b.subTasks?.every(s => s.completed) || false;
    return aDone - bDone;
  });

  const html = tasks.map(t => {
    const subTasks = t.subTasks || [];
    const doneCount = subTasks.filter(s => s.completed).length;
    const totalCount = subTasks.length;
    const percent = totalCount ? Math.round(doneCount / totalCount * 100) : 0;

    const undone = subTasks.filter(s => !s.completed);
    const done = subTasks.filter(s => s.completed);

    const buildRow = (s, isCompleted = false) => {
      let btn = "";
      if (!isCompleted) {
        if (s._id === liveTaskId) {
          btn = `<button class="task-btn paused" onclick="toggleTask('${s._id}')">⏸️ Pause</button>`;
        } else {
          btn = `<button class="task-btn" onclick="toggleTask('${s._id}')">▶️ Start</button>`;
        }
      }

      return `
        <div class="task-item ${isCompleted ? 'completed' : ''}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; margin-bottom: 8px;">
          <label style="flex: 1; display: flex; align-items: center; gap: 8px; cursor: pointer; color: ${isCompleted ? '#94a3b8' : 'white'};">
            <input type="checkbox" ${isCompleted ? 'checked disabled' : ''} onchange="completeTask('${s._id}', this)" style="width: 18px; height: 18px;">
            <span style="text-decoration: ${isCompleted ? 'line-through' : 'none'};">${s.title} (${s.durationMin} min)</span>
          </label>
          ${btn}
        </div>`;
    };

    return `
      <div class="task-block" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <h3 style="color: white; margin: 0 0 16px 0; font-size: 18px;">${t.name} — ${percent}% (${doneCount}/${totalCount})</h3>
        ${undone.map(s => buildRow(s, false)).join('')}
        ${done.map(s => buildRow(s, true)).join('')}
      </div>`;
  }).join('');

  if (html !== lastTaskListHTML) {
    document.getElementById('list').innerHTML = html;
    lastTaskListHTML = html;
  }
}


// ✅ PART 14: TASK CONTROL & LIVE PANEL
// ====================================

let lastYTID = null;
let lastPDF = null;
let lastIMG = null;


async function toggleTask(taskId) {
  const btn = document.querySelector(`button[onclick="toggleTask('${taskId}')"]`);
  
  try {
    const sub = await fetch(`${API_URL}/tasks/subtasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    if (sub.pdfLink) {
      alert('📄 PDF tasks cannot be paused.');
      return;
    }
    
    if (btn.textContent.includes('Start')) {
      // ==================== STARTING TASK ====================
      await fetch(`${API_URL}/tasks/subtasks/${taskId}/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      btn.innerHTML = '⏸️ Pause';
      btn.classList.add('paused');
      liveTaskId = taskId;
      
      const myUserId = user.id || user._id;
      const myTimer = userTimers.get(myUserId);
      
      if (myTimer) {
        myTimer.isPaused = false;
        myTimer.startTime = Date.now();
        myTimer.pausedDuration = 0;
      } else {
        userTimers.set(myUserId, {
          startTime: Date.now(),
          pausedDuration: 0,
          isPaused: false
        });
      }
      
      await updateLivePanel();
      
      // 🔥 Resume YouTube safely
      if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
        try {
          youtubePlayer.playVideo();
          console.log('▶️ YouTube PLAYING');
        } catch (e) {
          console.error('Error playing YouTube:', e);
        }
      }
      
      updateTimerBadges();
      
      socket.emit('task-started', {
        roomId: roomId,
        userId: myUserId,
        taskTitle: sub.title,
        ytLink: sub.ytLink,
        pdfLink: sub.pdfLink
      });
      
    } else {
      // ==================== PAUSING TASK ====================
      await fetch(`${API_URL}/tasks/subtasks/${taskId}/pause`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      btn.innerHTML = '▶️ Start';
      btn.classList.remove('paused');
      
      // 🔥 Pause YouTube safely
      if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
        try {
          youtubePlayer.pauseVideo();
          console.log('⏸️ YouTube PAUSED');
        } catch (e) {
          console.error('Error pausing YouTube:', e);
        }
      }
      
      const myUserId = user.id || user._id;
      const myTimer = userTimers.get(myUserId);
      if (myTimer) {
        myTimer.isPaused = true;
        myTimer.pausedAt = Date.now();
      }
      
      socket.emit('task-paused', {
        roomId: roomId,
        userId: myUserId
      });
      
      updateTimerBadges();
      
      if (liveTaskId === taskId) {
        liveTaskId = null;
        document.getElementById('ongoing').style.display = 'none';
      }
    }
    
  } catch (error) {
    console.error('❌ Error toggling task:', error);
  }
}

async function completeTask(taskId, checkbox) {
  if (confirm('Mark this task as completed?')) {
    try {
      await fetch(`${API_URL}/tasks/subtasks/${taskId}/complete`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      checkbox.checked = true;
      
      if (liveTaskId === taskId) {
        liveTaskId = null;
      }
      
      // 🔥 Load fresh tasks
      await loadTasks();
      
      // 🔥 IMMEDIATELY emit progress (don't wait)
      console.log('🎯 Task completed, emitting progress NOW');
      emitTaskProgress();
      
    } catch (error) {
      console.error('Error completing task:', error);
      checkbox.checked = false;
    }
  } else {
    checkbox.checked = false;
  }
}


setInterval(() => {
  emitTaskProgress();
}, 30000);
// 🔥 PART 6: Listen for broadcasted task progress (studyroom.js)
// =============================================================

socket.on('participant-task-progress', ({ userId, username, tasksCompleted, totalTasks, timestamp }) => {
  console.log(`📊 RECEIVED broadcast: ${username} - ${tasksCompleted}/${totalTasks}`);
  
  // 🔥 FIX: Update the participant in cached list
  const participant = cachedParticipants.find(p => p.userId.toString() === userId.toString());
  
  if (participant) {
    // Update their task progress
    participant.tasksCompleted = tasksCompleted;
    participant.totalTasks = totalTasks;
    
    console.log(`✅ Updated cache for ${username}: ${tasksCompleted}/${totalTasks}`);
    
    // 🔥 RE-RENDER to show updated progress
    renderParticipants(cachedParticipants);
  } else {
    console.warn(`⚠️ Participant not found in cache: ${userId}`);
  }
});
async function updateLivePanel() {
  if (!liveTaskId) {
    document.getElementById('ongoing').style.display = 'none';
    return;
  }
  
  document.getElementById('ongoing').style.display = 'block';

  try {
    let sub = null;
    let isCollaborationTask = false;
    
    // Check if this is a collaboration task (format: taskId-subTaskId)
    if (liveTaskId.includes('-')) {
      const [taskId, subTaskId] = liveTaskId.split('-');
      const collabTask = collaborationTasks.find(t => t._id === taskId);
      if (collabTask) {
        sub = collabTask.subTasks.find(st => st._id === subTaskId);
        if (sub) {
          // Create a copy to avoid modifying the original
          sub = { ...sub, title: `${collabTask.title} - ${sub.title}` };
          isCollaborationTask = true;
        }
      }
    }
    
    // If not a collaboration task, fetch normal subtask
    if (!isCollaborationTask) {
      sub = await fetch(`${API_URL}/tasks/subtasks/${liveTaskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
    }

    if (!sub) {
      console.error('❌ Subtask not found for liveTaskId:', liveTaskId);
      document.getElementById('ongoing').style.display = 'none';
      return;
    }

    // Only update title if it changed
    const currentTitle = document.getElementById('otitle').textContent;
    const newTitle = 'ONGOING: ' + sub.title;
    if (currentTitle !== newTitle) {
      document.getElementById('otitle').textContent = newTitle;
    }
    const wrap = document.getElementById('mediawrap');

    // PDF
    if (sub.pdfLink) {
      wrap.innerHTML = `
        <div class="pdf-preview-card" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)); border: 2px solid #667eea; border-radius: 12px; padding: 20px; margin-top: 16px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div style="width: 80px; height: 100px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 48px;">📄</div>
            <div style="flex: 1;">
              <div style="color: white; font-weight: 700; font-size: 18px; margin-bottom: 6px;">${sub.title}</div>
              <div style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">PDF • ${sub.durationMin} min read</div>
            </div>
          </div>
          <button onclick="window.open('${sub.pdfLink}', '_blank')" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">
            📄 Open PDF Reader
          </button>
        </div>
      `;
      youtubePlayer = null;
      lastYTID = null;
      lastPDF = sub.pdfLink;
      return;
    }

    // YouTube
    let ytID = '';
    if (sub.ytLink) {
      try {
        // 🔥 Extract video ID from various YouTube formats
        if (sub.ytLink.includes('youtu.be/')) {
          // youtu.be/VIDEO_ID format
          ytID = sub.ytLink.split('youtu.be/')[1].split('?')[0];
        } else if (sub.ytLink.includes('youtube.com/watch')) {
          // youtube.com/watch?v=VIDEO_ID format
          const url = new URL(sub.ytLink);
          ytID = url.searchParams.get('v');
        } else if (sub.ytLink.includes('youtube.com/embed/')) {
          // youtube.com/embed/VIDEO_ID format
          ytID = sub.ytLink.split('embed/')[1].split('?')[0];
        } else {
          // Try direct extraction as fallback
          ytID = sub.ytLink.split('/').pop().split('?')[0];
        }
        
        console.log('📺 Extracted YouTube ID:', ytID);
        
        // 🔥 Validate video ID length (YouTube IDs are 11 characters)
        if (!ytID || ytID.length !== 11) {
          console.error('❌ Invalid YouTube ID:', ytID, 'Length:', ytID?.length);
          wrap.innerHTML = `<p style="color: #ef4444;">❌ Invalid YouTube link format</p>`;
          lastYTID = null;
          youtubePlayer = null;
          return;
        }
      } catch (e) {
        console.error('❌ YouTube URL parsing error:', e, 'Link:', sub.ytLink);
        wrap.innerHTML = `<p style="color: #ef4444;">❌ Error parsing YouTube link</p>`;
        lastYTID = null;
        youtubePlayer = null;
        return;
      }
    }
    
    if (ytID && ytID !== lastYTID) {
      // 🔥 Wait for YouTube API to be ready
      if (!youtubeApiReady) {
        console.log('⏳ Waiting for YouTube API...');
        wrap.innerHTML = `<p style="color: #94a3b8;">Loading YouTube...</p>`;
        
        // Wait up to 5 seconds for API to load
        let attempts = 0;
        const waitForAPI = setInterval(() => {
          attempts++;
          if (youtubeApiReady || attempts > 50) {
            clearInterval(waitForAPI);
            if (youtubeApiReady) {
              updateLivePanel(); // Retry
            } else {
              wrap.innerHTML = `<p style="color: #ef4444;">YouTube API failed to load</p>`;
            }
          }
        }, 100);
        return;
      }
      
      // 🔥 Create player with error handling
      try {
        const playerId = `youtube-player-${liveTaskId}`;
        wrap.innerHTML = `<div id="${playerId}"></div>`;
        
        youtubePlayer = new YT.Player(playerId, {
          height: '315',
          width: '100%',
          videoId: ytID,
          playerVars: {
            'autoplay': 1,
            'controls': 1,
            'modestbranding': 1,
            'rel': 0
          },
          events: {
            'onError': (e) => {
              console.error('🔴 YouTube Player Error:', e.data);
              wrap.innerHTML = `<p style="color: #ef4444;">❌ Video unavailable</p>`;
            }
          }
        });
        
        console.log('✅ YouTube player created:', ytID);
        lastYTID = ytID;
        lastPDF = null;
        lastIMG = null;
      } catch (e) {
        console.error('❌ YouTube player creation error:', e);
        wrap.innerHTML = `<p style="color: #ef4444;">❌ Failed to load video</p>`;
      }
      return;
    }

    // Image
    if (sub.imgPath && sub.imgPath !== lastIMG) {
      wrap.innerHTML = `<img src="${sub.imgPath}" style="max-width:100%; border-radius: 8px;">`;
      youtubePlayer = null;
      lastIMG = sub.imgPath;
      lastYTID = null;
      return;
    }

    if (!sub.ytLink && !sub.pdfLink && !sub.imgPath && (lastYTID || lastPDF || lastIMG)) {
      wrap.innerHTML = '';
      youtubePlayer = null;
      lastYTID = lastPDF = lastIMG = null;
    }
  } catch (error) {
    console.error('Error updating live panel:', error);
  }
}



// Update live clock every second
setInterval(async () => {
  if (!liveTaskId) return;

  try {
    let sub = null;
    let isCollaborationTask = false;
    let elapsedWorkingMs = 0;
    let isPaused = false;
    
    // Check if this is a collaboration task (format: taskId-subTaskId)
    if (liveTaskId.includes('-')) {
      const [taskId, subTaskId] = liveTaskId.split('-');
      const collabTask = collaborationTasks.find(t => t._id === taskId);
      if (collabTask) {
        sub = collabTask.subTasks.find(st => st._id === subTaskId);
        if (sub) {
          // Create a copy to avoid modifying the original
          sub = { ...sub, title: `${collabTask.title} - ${sub.title}` };
          isCollaborationTask = true;
          
          // Get timing from userTimers
          const myUserId = user.id || user._id;
          const myTimer = userTimers.get(myUserId);
          if (myTimer) {
            const now = Date.now();
            if (myTimer.isPaused) {
              elapsedWorkingMs = myTimer.pausedDuration;
              isPaused = true;
            } else {
              elapsedWorkingMs = now - myTimer.startTime + myTimer.pausedDuration;
            }
          }
        }
      }
    }
    
    // If not a collaboration task, fetch normal subtask timing
    if (!isCollaborationTask) {
      sub = await fetch(`${API_URL}/tasks/subtasks/${liveTaskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());

      const now = Date.now();
      const started = new Date(sub.startedAt).getTime();
      let totalPausedMs = sub.totalPausedMs || 0;
      
      if (sub.pausedAt) {
        const currentPauseDuration = now - new Date(sub.pausedAt).getTime();
        elapsedWorkingMs = now - started - totalPausedMs - currentPauseDuration;
        isPaused = true;
      } else {
        elapsedWorkingMs = now - started - totalPausedMs;
      }
    }

    if (!sub) return;

    const elapsedMin = Math.floor(elapsedWorkingMs / 60000);
    const elapsedSec = Math.floor((elapsedWorkingMs % 60000) / 1000);

    const el = document.getElementById('elapsed');
    if (el) el.textContent = `Time spent: ${elapsedMin}m ${elapsedSec}s`;

    const plannedMs = sub.durationMin * 60 * 1000;
    const remainingMs = plannedMs - elapsedWorkingMs;
    
    const oclockEl = document.getElementById('oclock');
    if (oclockEl) {
      if (isPaused) {
        const remainingMin = Math.ceil(remainingMs / 60000);
        oclockEl.textContent = `⏸️ PAUSED - ${remainingMin} min remaining`;
        oclockEl.style.color = '#f59e0b';
      } else {
        const finishTime = new Date(Date.now() + remainingMs);
        oclockEl.textContent = 'Finishes at: ' + finishTime.toLocaleTimeString();
        oclockEl.style.color = '#10b981';
      }
    }
  } catch (error) {
    console.error('Error updating live clock:', error);
  }
}, 1000);


// ✅ PART 15: LEAVE ROOM
// ====================

async function leaveRoom() {
  if (confirm('Leave this study room?')) {
    try {
      socket.emit('leave-room', {
        roomId: roomId,
        userId: user.id || user._id
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/html/study.html';
    } catch (error) {
      console.error('Error leaving room:', error);
      window.location.href = '/html/study.html';
    }
  }
}

window.addEventListener('beforeunload', () => {
  if (socket && roomId) {
    socket.emit('leave-room', {
      roomId: roomId,
      userId: user.id || user._id
    });
  }
});


// ✅ PART 16: TAB VISIBILITY
// ==========================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isTabVisible = false;
    const myTimer = userTimers.get(user.id || user._id);
    if (myTimer && !myTimer.isPaused) {
      myTimer.isPaused = true;
    }
  } else {
    isTabVisible = true;
    const myTimer = userTimers.get(user.id || user._id);
    if (myTimer && myTimer.isPaused && liveTaskId) {
      myTimer.isPaused = false;
    }
  }
});


// ✅ PART 17: INITIALIZATION
// ==========================


async function initialize() {
  console.log('🚀 Initializing study room...');
  
  // Fetch room title
  fetch(`${API_URL}/rooms/${roomId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      document.getElementById('roomTitle').textContent = data.room.name;
    }
  })
  .catch(error => console.error('Error fetching room:', error));
  
  // ✅ FETCH PARTICIPANTS IMMEDIATELY
  fetchAndRenderParticipants();
  
  // ✅ REFRESH PARTICIPANTS EVERY 5 SECONDS
  participantsRefreshInterval = setInterval(fetchAndRenderParticipants, 5000);
  
  // ✅ LOAD TASKS IMMEDIATELY (CRITICAL!)
  await loadTasks();
  
  // ✅ EMIT TASK PROGRESS IMMEDIATELY AFTER LOADING TASKS
  emitTaskProgress();
  
  // ✅ RELOAD TASKS EVERY 10 SECONDS
  tasksRefreshInterval = setInterval(loadTasks, 10000);
  
  // ✅ UPDATE TIMER BADGES EVERY 1 SECOND
  setInterval(updateTimerBadges, 1000);
  
  console.log('✅ Study room initialized');
  try {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('roomTitle').textContent = data.room.name;
      
      const currentUserId = user.id || user._id;
      const creatorId = data.room.creator._id || data.room.creator;
      
      if (creatorId === currentUserId || creatorId.toString() === currentUserId.toString()) {
        document.getElementById('createCollabBtn').style.display = 'inline-block';
      }
    }
  } catch (error) {
    console.error('Error fetching room:', error);
  }
  
  // 🤝 LOAD COLLABORATION TASKS
  await loadCollaborationTasks();
  
  // 🤝 CHECK ADMIN FOR CREATE BUTTON
  await checkAdminAndShowCreateBtn();
  
  // 🤝 RELOAD COLLAB TASKS EVERY 15 SECONDS
  setInterval(loadCollaborationTasks, 15000);
  
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}


// ========== COLLABORATION TASKS STATE ==========
let collaborationTasks = [];


// ========== CHECK ADMIN AND SHOW CREATE BUTTON ==========
async function checkAdminAndShowCreateBtn() {
  try {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) return;
    
    const roomData = await response.json();
    const room = roomData.room;
    const creatorId = room.creator._id || room.creator;
    const currentUserId = user.id || user._id;
    
    const createBtn = document.getElementById('createCollabBtn');
    if (createBtn) {
      createBtn.style.display = (creatorId === currentUserId || creatorId.toString() === currentUserId.toString()) ? 'inline-block' : 'none';
    }
  } catch (error) {
    console.error('❌ Error checking admin:', error);
  }
}


// ========== 1️⃣ LOAD COLLABORATION TASKS ==========
async function loadCollaborationTasks() {
  try {
    const response = await fetch(`${API_URL}/collaboration-tasks/room/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      console.error('❌ Failed to load collab tasks:', response.status);
      return;
    }
    
    collaborationTasks = await response.json();
    console.log('📋 Loaded collaboration tasks:', collaborationTasks.length);
    
    renderCollaborationTasks(collaborationTasks);
  } catch (error) {
    console.error('❌ Error loading collaboration tasks:', error);
  }
}


// ========== 2️⃣ RENDER COLLABORATION TASKS ==========
function renderCollaborationTasks(tasks) {
  const container = document.getElementById('collaborationTasksContainer');
  
  if (!container) {
    console.warn('⚠️ Collaboration container not found');
    return;
  }
  
  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #94a3b8; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
        <p>No collaboration tasks yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = tasks.map(task => {
    const completions = task.completions || [];
    const totalSubTasks = task.subTasks?.length || 0;
    
    // Find current user's completion
    const currentUserId = user.id || user._id;
    const userCompletion = completions.find(c => {
      const cUserId = c.userId?._id || c.userId;
      return cUserId === currentUserId || cUserId.toString() === currentUserId.toString();
    });
    
    const userCompletedCount = userCompletion?.completedSubTasks?.length || 0;
    const userProgress = totalSubTasks > 0 ? Math.round((userCompletedCount / totalSubTasks) * 100) : 0;
    
    // Count fully completed users
    const completedByCount = completions.filter(c => 
      c.completedSubTasks.length === totalSubTasks
    ).length;
    
    const participantsCount = cachedParticipants.length;
    
    // Build subtasks HTML
    const subTasksHTML = (task.subTasks || []).map(st => {
      const isCompleted = userCompletion?.completedSubTasks?.some(id => 
        id === st._id || id.toString() === st._id.toString()
      );
      
      const completedCount = (completions || []).filter(c => 
        (c.completedSubTasks || []).some(id => id.toString() === st._id.toString())
      ).length;
      
      // Check if this subtask is currently active for the user
      const myUserId = user.id || user._id;
      const myTimer = userTimers.get(myUserId);
      const isActive = liveTaskId === `${task._id}-${st._id}`;
      const isPaused = myTimer && myTimer.isPaused && isActive;
      
      let actionButton = '';
      if (!isCompleted) {
        if (isActive && !isPaused) {
          actionButton = `<button class="task-btn paused" onclick="toggleCollabSubtask('${task._id}', '${st._id}')">⏸️ Pause</button>`;
        } else {
          actionButton = `<button class="task-btn" onclick="toggleCollabSubtask('${task._id}', '${st._id}')">▶️ Start</button>`;
        }
      }
      
      return `
        <div class="collab-subtask ${isCompleted ? 'completed' : ''}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 8px; margin-bottom: 8px;">
          <label style="flex: 1; display: flex; align-items: center; gap: 8px; cursor: pointer; color: ${isCompleted ? '#94a3b8' : 'white'};">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} 
              onchange="completeCollabSubtask('${task._id}', '${st._id}', this)"
              style="width: 18px; height: 18px; cursor: pointer; accent-color: #667eea;">
            <span style="text-decoration: ${isCompleted ? 'line-through' : 'none'};">
              ${st.title} (${st.durationMin} min) - ${completedCount}/${participantsCount} completed
            </span>
          </label>
          ${actionButton}
        </div>
      `;
    }).join('');
    
    // Build user progress HTML
    const userProgressHTML = renderCollabUserProgress(task, completions, totalSubTasks);
    
    return `
      <div class="collab-task-block">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <h3 style="color: #667eea; margin: 0 0 4px 0; font-size: 18px;">🤝 ${task.title}</h3>
            <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">${task.description || ''}</p>
            <p style="color: #10b981; font-size: 14px; margin: 0;">👥 ${completedByCount} user(s) completed</p>
          </div>
          <div style="text-align: right;">
            <div style="color: #667eea; font-weight: 700; font-size: 18px;">${userProgress}%</div>
            <div style="color: #94a3b8; font-size: 12px;">Your Progress</div>
          </div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${userProgress}%;"></div>
        </div>
        <div style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">${userCompletedCount}/${totalSubTasks} subtasks</div>
        
        <div class="collab-subtasks-list">
          ${subTasksHTML}
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <h4 style="color: #94a3b8; margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase;">Completion Status</h4>
          <div id="collab-users-${task._id}" class="collab-users-list">
            ${userProgressHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


// ========== 3️⃣ RENDER USER PROGRESS ==========
function renderCollabUserProgress(task, completions, totalSubTasks) {
  return completions.map(c => {
    const completed = c.completedSubTasks.length === totalSubTasks;
    const percent = totalSubTasks > 0 ? Math.round((c.completedSubTasks.length / totalSubTasks) * 100) : 0;
    const avatar = c.avatar || c.username?.charAt(0).toUpperCase() || '?';
    
    return `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">
        </div>
        <div style="flex: 1;">
          <div style="color: white; font-size: 14px; font-weight: 600;">${c.username}</div>
          <div style="color: #94a3b8; font-size: 12px;">${c.completedSubTasks.length}/${totalSubTasks}</div>
        </div>
        <div style="text-align: right;">
          ${completed ? '<span style="color: #10b981; font-weight: 700;">✅ Done</span>' : `<span style="color: #667eea; font-weight: 600;">${percent}%</span>`}
        </div>
      </div>
    `;
  }).join('');
}


// ========== 4️⃣ COMPLETE COLLABORATION SUBTASK ==========
async function completeCollabSubtask(taskId, subTaskId, checkbox) {
  try {
    const response = await fetch(`${API_URL}/collaboration-tasks/${taskId}/complete-subtask`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subTaskId: subTaskId })
    });
    
    if (!response.ok) {
      console.error('❌ Failed to complete subtask');
      checkbox.checked = !checkbox.checked;
      alert('Failed to mark task as complete. Please try again.');
      return;
    }
    
    const updatedTask = await response.json();
    
    // Update local cache
    const taskIndex = collaborationTasks.findIndex(t => t._id === taskId);
    if (taskIndex >= 0) {
      collaborationTasks[taskIndex] = updatedTask;
    }
    
    // Clear liveTaskId to hide ongoing panel (like normal tasks)
    if (liveTaskId === `${taskId}-${subTaskId}`) {
      liveTaskId = null;
      document.getElementById('ongoing').style.display = 'none';
    }
    
    renderCollaborationTasks(collaborationTasks);
    
    console.log('✅ Subtask completed and broadcasted');
    
  } catch (error) {
    console.error('❌ Error completing subtask:', error);
    checkbox.checked = !checkbox.checked;
    alert('Error completing subtask. Please try again.');
  }
}


// ========== 5️⃣ OPEN COLLABORATION TASK CREATION MODAL ==========
async function openCollabTaskModal() {
  try {
    // Check if user is admin
    const currentUserId = user.id || user._id;
    const roomResponse = await fetch(`${API_URL}/rooms/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const roomData = await roomResponse.json();
    const room = roomData.room;
    
    const creatorId = room.creator._id || room.creator;
    
    if (creatorId !== currentUserId && creatorId.toString() !== currentUserId.toString()) {
      alert('⛔ Only room creator can create collaboration tasks');
      return;
    }
    
    // Create modal HTML
    const modalHTML = `
      <div id="collabModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: #1e1e1e; padding: 30px; border-radius: 16px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
          <h2 style="color: #667eea; margin-top: 0; margin-bottom: 20px;">🤝 Create Collaboration Task</h2>
          
          <input type="text" id="collabTitle" placeholder="Task Title" style="width: 100%; padding: 12px; margin-bottom: 16px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
          
          <textarea id="collabDesc" placeholder="Description (optional)" style="width: 100%; padding: 12px; margin-bottom: 16px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 8px; color: white; min-height: 80px; font-size: 14px; box-sizing: border-box; font-family: inherit;"></textarea>
          
          <div id="collabSubTasks" style="margin-bottom: 16px;"></div>
          
          <button onclick="addCollabSubtaskField()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 16px; font-weight: 600; font-size: 14px;">
            ➕ Add Subtask
          </button>
          
          <div style="display: flex; gap: 12px;">
            <button onclick="submitCollabTask()" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
              ✅ Create Task
            </button>
            <button onclick="closeCollabModal()" style="flex: 1; padding: 12px; background: #3a3a3a; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add first subtask field
    addCollabSubtaskField();
    
  } catch (error) {
    console.error('❌ Error opening modal:', error);
    alert('Error opening task creation form');
  }
}


// ========== 6️⃣ ADD SUBTASK FIELD ==========
function addCollabSubtaskField() {
  const container = document.getElementById('collabSubTasks');
  if (!container) return;
  
  const count = container.children.length + 1;
  
  const field = document.createElement('div');
  field.style.cssText = 'background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 2px solid rgba(96, 165, 250, 0.3);';
  field.innerHTML = `
    <input type="text" class="collab-st-title" placeholder="Subtask #${count} Title" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 6px; color: white; box-sizing: border-box; font-size: 12px;">
    <input type="number" class="collab-st-duration" placeholder="Duration (min)" min="1" max="480" value="30" style="width: 100%; padding: 8px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 6px; color: white; box-sizing: border-box; font-size: 12px; margin-bottom: 8px;">
    
    <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; margin-top: 8px;">
      <label style="display: block; color: #93c5fd; font-size: 13px; margin-bottom: 8px; font-weight: 600;">📎 Attach Resources (Optional)</label>
      
      <input type="text" class="collab-st-yt" placeholder="🎥 YouTube link" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 6px; color: white; box-sizing: border-box; font-size: 12px;">
      
      <input type="text" class="collab-st-pdf" placeholder="📄 PDF link (from your library)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #2a2a2a; border: 1px solid #667eea; border-radius: 6px; color: white; box-sizing: border-box; font-size: 12px;">
      
      <input type="file" class="collab-st-img" accept="image/*" style="width: 100%; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid #667eea; border-radius: 6px; color: white; box-sizing: border-box; font-size: 12px; cursor: pointer;">
      
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
        💡 Tip: Add PDF from <a href="/html/cart.html" target="_blank" style="color: #667eea;">your library</a>
      </div>
    </div>
  `;
  
  container.appendChild(field);
}


// ========== 7️⃣ CLOSE COLLABORATION MODAL ==========
function closeCollabModal() {
  const modal = document.getElementById('collabModal');
  if (modal) {
    modal.remove();
  }
}


// ========== 8️⃣ SUBMIT COLLABORATION TASK ==========
async function submitCollabTask() {
  try {
    const title = document.getElementById('collabTitle').value.trim();
    const description = document.getElementById('collabDesc').value.trim();
    
    if (!title) {
      alert('Please enter a task title');
      return;
    }
    
    const subTasksFields = document.querySelectorAll('#collabSubTasks > div');
    const subTasks = [];
    
    for (const field of subTasksFields) {
      const title = field.querySelector('.collab-st-title').value.trim();
      if (!title) continue;
      
      const subTask = {
        title: title,
        durationMin: parseInt(field.querySelector('.collab-st-duration').value) || 30,
        ytLink: field.querySelector('.collab-st-yt').value.trim() || undefined,
        pdfLink: field.querySelector('.collab-st-pdf').value.trim() || undefined
      };
      
      // Handle image upload
      const imgFile = field.querySelector('.collab-st-img').files[0];
      if (imgFile) {
        try {
          const formData = new FormData();
          formData.append('image', imgFile);
          
          const uploadResponse = await fetch(`${API_URL}/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            subTask.imgPath = uploadData.path;
          } else {
            console.error('Failed to upload image');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
      
      subTasks.push(subTask);
    }
    
    if (subTasks.length === 0) {
      alert('Please add at least one subtask');
      return;
    }
    
    const response = await fetch(`${API_URL}/collaboration-tasks/room/${roomId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, subTasks })
    });
    
    if (!response.ok) {
      const error = await response.json();
      alert('Failed to create task: ' + (error.message || 'Unknown error'));
      return;
    }
    
    const newTask = await response.json();
    collaborationTasks.push(newTask);
    
    // Broadcast to room
    socket.emit('collaboration-task-created', { roomId: roomId });
    
    // Close modal and refresh
    closeCollabModal();
    renderCollaborationTasks(collaborationTasks);
    
    console.log('✅ Collaboration task created');
  } catch (error) {
    console.error('❌ Error creating collab task:', error);
    alert('Error creating collaboration task. Please try again.');
  }
}


// ========== 9️⃣ LISTEN FOR COLLABORATION TASK UPDATES (SOCKET.IO) ==========
socket.on('collab-task-progress-update', ({ taskId, userId, username, completedCount, totalCount, isFullyCompleted, timestamp }) => {
  console.log(`📊 ${username}: ${completedCount}/${totalCount}`);
  
  // Find and update task in local cache
  const task = collaborationTasks.find(t => t._id === taskId);
  if (task) {
    let userComp = task.completions.find(c => {
      const cUserId = c.userId?._id || c.userId;
      return cUserId === userId || cUserId.toString() === userId.toString();
    });
    
    if (!userComp) {
      userComp = {
        userId: { _id: userId },
        username: username,
        avatar: username.charAt(0).toUpperCase(),
        completedSubTasks: Array(completedCount).fill(0).map(() => new mongoose.Types.ObjectId()),
        completedAt: isFullyCompleted ? new Date() : null,
        totalTimeSpent: 0
      };
      task.completions.push(userComp);
    } else {
      userComp.completedSubTasks = Array(completedCount).fill(0).map((_, i) => task.subTasks[i]._id);
      if (isFullyCompleted) {
        userComp.completedAt = new Date();
      }
    }
    
    // Re-render user progress section
    const userProgressDiv = document.getElementById(`collab-users-${taskId}`);
    if (userProgressDiv) {
      userProgressDiv.innerHTML = renderCollabUserProgress(task, task.completions, task.subTasks.length);
    }
  }
});

socket.on('collab-tasks-list-update', (tasks) => {
  console.log('📋 Collaboration tasks list updated');
  collaborationTasks = tasks;
  renderCollaborationTasks(tasks);
});

socket.on('collab-subtask-started', ({ taskId, subTaskId, userId, username }) => {
  console.log(`▶️ ${username} started collab subtask`);
  // Update the UI to show this subtask as active for this user
  renderCollaborationTasks(collaborationTasks);
});

socket.on('collab-subtask-paused', ({ taskId, subTaskId, userId, username }) => {
  console.log(`⏸️ ${username} paused collab subtask`);
  // Update the UI to show this subtask as paused for this user
  renderCollaborationTasks(collaborationTasks);
});

// ========== TOGGLE COLLABORATION SUBTASK ==========
async function toggleCollabSubtask(taskId, subTaskId) {
  const btn = document.querySelector(`button[onclick="toggleCollabSubtask('${taskId}', '${subTaskId}')"]`);
  
  try {
    // Find the subtask to check if it's a PDF task
    const task = collaborationTasks.find(t => t._id === taskId);
    const subTask = task?.subTasks?.find(st => st._id === subTaskId);
    
    if (subTask?.pdfLink) {
      alert('📄 PDF tasks cannot be paused.');
      return;
    }
    
    if (btn.textContent.includes('Start')) {
      // ==================== STARTING COLLAB SUBTASK ====================
      
      // Pause any currently running task first
      if (liveTaskId && liveTaskId !== `${taskId}-${subTaskId}`) {
        // If there's a different task running, pause it
        if (!liveTaskId.includes('-')) {
          // It's a normal task, pause it via API
          try {
            await fetch(`${API_URL}/tasks/subtasks/${liveTaskId}/pause`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('⏸️ Paused previous normal task');
          } catch (error) {
            console.error('Error pausing previous task:', error);
          }
        }
        // Clear the previous live task
        liveTaskId = null;
      }
      
      await fetch(`${API_URL}/collaboration-tasks/${taskId}/subtasks/${subTaskId}/start`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId: roomId })
      });
      
      btn.innerHTML = '⏸️ Pause';
      btn.classList.add('paused');
      liveTaskId = `${taskId}-${subTaskId}`;
      
      const myUserId = user.id || user._id;
      const myTimer = userTimers.get(myUserId);
      
      if (myTimer) {
        myTimer.isPaused = false;
        myTimer.startTime = Date.now();
        myTimer.pausedDuration = 0;
      } else {
        userTimers.set(myUserId, {
          startTime: Date.now(),
          pausedDuration: 0,
          isPaused: false
        });
      }
      
      await updateLivePanel();
      
      // 🔥 Resume YouTube safely
      if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
        try {
          youtubePlayer.playVideo();
          console.log('▶️ YouTube PLAYING');
        } catch (e) {
          console.error('Error playing YouTube:', e);
        }
      }
      
      updateTimerBadges();
      
      socket.emit('task-started', {
        roomId: roomId,
        userId: myUserId,
        taskTitle: subTask.title,
        ytLink: subTask.ytLink,
        pdfLink: subTask.pdfLink
      });
      
    } else {
      // ==================== PAUSING COLLAB SUBTASK ====================
      await fetch(`${API_URL}/collaboration-tasks/${taskId}/subtasks/${subTaskId}/pause`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId: roomId })
      });
      
      btn.innerHTML = '▶️ Start';
      btn.classList.remove('paused');
      
      // 🔥 Pause YouTube safely
      if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
        try {
          youtubePlayer.pauseVideo();
          console.log('⏸️ YouTube PAUSED');
        } catch (e) {
          console.error('Error pausing YouTube:', e);
        }
      }
      
      // Update timer
      const myUserId = user.id || user._id;
      const myTimer = userTimers.get(myUserId);
      if (myTimer) {
        myTimer.isPaused = true;
        myTimer.pausedAt = Date.now();
      }
      
      // Clear liveTaskId to hide ongoing panel (like normal tasks)
      if (liveTaskId === `${taskId}-${subTaskId}`) {
        liveTaskId = null;
        document.getElementById('ongoing').style.display = 'none';
      }
      
      await updateLivePanel();
      updateTimerBadges();
      
      socket.emit('task-paused', {
        roomId: roomId,
        userId: myUserId,
        taskTitle: subTask.title
      });
    }
  } catch (error) {
    console.error('❌ Error toggling collab subtask:', error);
    alert('Error toggling task. Please try again.');
  }
}

