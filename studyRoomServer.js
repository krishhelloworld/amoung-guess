import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// ⭐ CRITICAL MIDDLEWARE - MUST BE FIRST
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.resolve('public')));

// Simple health endpoint
app.get('/_health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

// Import routes
import taskRoutes from './routes/taskRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import pdfMetadataRoutes from './routes/pdfMetadataRoutes.js';
import pdfUploadRoutes from './routes/pdfUploadRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { startDailyCleanupScheduler } from './services/dailyCleanupScheduler.js';
import Room from './models/room.js';
import createContestRouter from './routes/contestRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { lobbies } from './routes/quizRoutes.js';
import { upload, uploadToB2 } from "./config/backblazeb2.js";
import Task from './models/task.js';

import CollaborationTask from './models/collaborationTask.js';
import collaborationTaskRoutes from './routes/collaborationTaskRoutes.js';


// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/contest', createContestRouter(io));
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/rooms', roomRoutes);
console.log('🔧 Mounting PDF metadata routes at /api/pdf-meta');
app.use('/api/pdf-meta', pdfMetadataRoutes);
app.use('/api/pdf-upload', pdfUploadRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/collaboration-tasks', collaborationTaskRoutes);

app.set('io', io);
app.use(errorHandler);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const result = await uploadToB2(buffer, req.file.originalname, req.file.mimetype);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// ✅ STORE ACTIVE CONNECTIONS (OUTSIDE io.on)
const activeConnections = new Map();

// ✅ TIMER & PARTICIPANT BROADCAST MAPS (OUTSIDE io.on)
const roomTimerIntervals = new Map();
const roomParticipantIntervals = new Map();

// ✅ BROADCAST FUNCTIONS (OUTSIDE io.on - DEFINED ONCE)

async function startTimerBroadcast(roomId) {
  if (roomTimerIntervals.has(roomId)) {
    return;
  }
  
  console.log(`⏱️ Starting timer broadcast for room: ${roomId}`);
  
  const intervalId = setInterval(async () => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        clearInterval(intervalId);
        roomTimerIntervals.delete(roomId);
        return;
      }
      
      const hasActiveTask = room.participants.some(p => p.hasActiveTask && p.isActive);
      
      if (!hasActiveTask) {
        clearInterval(intervalId);
        roomTimerIntervals.delete(roomId);
        console.log(`⏹️ Stopped timer broadcast for room: ${roomId}`);
        return;
      }
      
      const timers = {};
      room.participants.forEach(p => {
        if (p.hasActiveTask) {
          const startTime = new Date(p.taskStartTime).getTime();
          const pausedDuration = p.totalPausedTime || 0;
          
          timers[p.userId.toString()] = {
            startTime: startTime,
            pausedDuration: pausedDuration,
            isPaused: false
          };
        } else {
          timers[p.userId.toString()] = {
            isPaused: true,
            pausedDuration: 0
          };
        }
      });
      
      io.to(roomId).emit('room-timers-update', {
        timers: timers,
        roomId: roomId,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Timer broadcast error:', error);
    }
  }, 1000);
  
  roomTimerIntervals.set(roomId, intervalId);
}

function stopTimerBroadcast(roomId) {
  if (roomTimerIntervals.has(roomId)) {
    clearInterval(roomTimerIntervals.get(roomId));
    roomTimerIntervals.delete(roomId);
    console.log(`⏹️ Stopped timer broadcast for room: ${roomId}`);
  }
}

async function startParticipantBroadcast(roomId) {
  if (roomParticipantIntervals.has(roomId)) {
    return;
  }
  
  console.log(`👥 Starting participant broadcast for room: ${roomId}`);
  
  const intervalId = setInterval(async () => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        clearInterval(intervalId);
        roomParticipantIntervals.delete(roomId);
        return;
      }
      
      const activeParticipants = room.participants.filter(p => p.isActive);
      
      if (activeParticipants.length === 0) {
        clearInterval(intervalId);
        roomParticipantIntervals.delete(roomId);
        return;
      }
      
      io.to(roomId).emit('participants-list-update', {
        participants: activeParticipants,
        roomId: roomId,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Participant broadcast error:', error);
    }
  }, 1000);
  
  roomParticipantIntervals.set(roomId, intervalId);
}

function stopParticipantBroadcast(roomId) {
  if (roomParticipantIntervals.has(roomId)) {
    clearInterval(roomParticipantIntervals.get(roomId));
    roomParticipantIntervals.delete(roomId);
    console.log(`⏹️ Stopped participant broadcast for room: ${roomId}`);
  }
}

// ✅ SOCKET.IO CONNECTION (ONE BLOCK - ALL HANDLERS INSIDE)

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // ==================== JOIN ROOM ====================
  socket.on('join-room', async ({ roomId, userId, username, avatar, email }) => {
    try {
      if (!roomId || !userId || !username) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      socket.join(roomId);
      activeConnections.set(userId, socket.id);
      
      let room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Remove duplicate participants
      const existingParticipantIndex = room.participants.findIndex(
        p => p.userId.toString() === userId.toString()
      );
      
      if (existingParticipantIndex >= 0) {
        room.participants[existingParticipantIndex].isActive = true;
        room.participants[existingParticipantIndex].socketId = socket.id;
        room.participants[existingParticipantIndex].lastSeen = new Date();
        room.participants[existingParticipantIndex].sessionStartTime = new Date();
      } else {
        room.participants.push({
          userId: userObjectId,
          username,
          avatar: avatar || username.charAt(0).toUpperCase(),
          email: email || '',
          socketId: socket.id,
          joinedAt: new Date(),
          isActive: true,
          status: 'studying',
          sessionStartTime: new Date(),
          totalStudyTime: 0,
          hasActiveTask: false,
          taskStartTime: null,
          tasksCompleted: 0,
          totalTasks: 0,
          isMuted: false
        });
      }
      
      // Remove duplicates
      const seen = new Set();
      room.participants = room.participants.filter(p => {
        const key = p.userId.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      // Send chat history
      const chatHistory = room.chatHistory.slice(-100);
      socket.emit('chat-history', chatHistory);
      
      // Add join message
      room.chatHistory.push({
        userId: null,
        username: 'System',
        message: `${username} joined the room`,
        type: 'system',
        timestamp: new Date(),
        messageId: `sys_${Date.now()}_${Math.random().toString(36).slice(2)}`
      });
      
      await room.save();
      
      const activeParticipants = room.participants.filter(p => p.isActive);
      
      io.to(roomId).emit('user-joined', {
        userId: userId,
        username: username,
        avatar: avatar,
        participants: activeParticipants
      });
      
      // ✅ START BROADCASTS
      startTimerBroadcast(roomId);
      startParticipantBroadcast(roomId);
      
      console.log(`✅ ${username} joined ${roomId}. Active: ${activeParticipants.length}`);
      
    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // ==================== LEAVE ROOM ====================
  socket.on('leave-room', async ({ roomId, userId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        const participant = room.participants.find(p => p.userId.toString() === userId);
        if (participant) {
          participant.isActive = false;
          
          if (participant.sessionStartTime) {
            const sessionDuration = Date.now() - new Date(participant.sessionStartTime).getTime();
            participant.totalStudyTime += sessionDuration;
          }
        }
        
        room.chatHistory.push({
          userId: null,
          username: 'System',
          message: `${participant?.username || 'User'} left the room`,
          type: 'system',
          timestamp: new Date()
        });
        
        await room.save();
        
        activeConnections.delete(userId);
        
        const activeParticipants = room.participants.filter(p => p.isActive);
        
        io.to(roomId).emit('user-left', {
          userId,
          username: participant?.username,
          participants: activeParticipants
        });
        
        // Check if room is now empty
        const hasActiveParticipants = room.participants.some(p => p.isActive);
        if (!hasActiveParticipants) {
          stopTimerBroadcast(roomId);
          stopParticipantBroadcast(roomId);
        }
      }
    } catch (error) {
      console.error('Leave room error:', error);
    }
  });

  // ==================== TASK PROGRESS UPDATE ====================

socket.on('task-progress-update', async ({ roomId, userId, username, tasksCompleted, totalTasks }) => {
  try {
    console.log(`📊 Received task progress from ${username}: ${tasksCompleted}/${totalTasks}`);
    
    const room = await Room.findOne({ roomId });
    if (!room) {
      console.error('❌ Room not found:', roomId);
      return;
    }
    
    // Find participant in room
    const participant = room.participants.find(p => p.userId.toString() === userId.toString());
    
    if (participant) {
      // 🔥 Update participant's task progress
      participant.tasksCompleted = tasksCompleted;
      participant.totalTasks = totalTasks;
      
      console.log(`✅ Updated ${username}'s progress: ${tasksCompleted}/${totalTasks}`);
    } else {
      console.warn(`⚠️ Participant not found: ${userId}`);
      return;
    }
    
    // Save room with updated participant data
    await room.save();
    
    // 🔥 BROADCAST to ALL participants in the room
    io.to(roomId).emit('participant-task-progress', {
      userId: userId,
      username: username,
      tasksCompleted: tasksCompleted,
      totalTasks: totalTasks,
      timestamp: Date.now()
    });
    
    console.log(`📢 Broadcasted ${username}'s progress to room: ${roomId}`);
    
  } catch (error) {
    console.error('❌ Task progress update error:', error);
  }
});
setInterval(async () => {
  try {
    const rooms = await Room.find({});
    
    for (const room of rooms) {
      const activeParticipants = room.participants.filter(p => p.isActive);
      
      if (activeParticipants.length === 0) continue;
      
      // Broadcast current task progress for all participants
      activeParticipants.forEach(p => {
        io.to(room.roomId).emit('participant-task-progress', {
          userId: p.userId.toString(),
          username: p.username,
          tasksCompleted: p.tasksCompleted || 0,
          totalTasks: p.totalTasks || 0,
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('❌ Task progress sync error:', error);
  }
}, 15000); // Every 15 seconds
  // ==================== CHAT MESSAGE ====================
  socket.on('chat-message', async ({ roomId, userId, username, message, messageId }) => {
    try {
      if (!roomId || !userId || !message?.trim()) return;
      
      const room = await Room.findOne({ roomId });
      if (!room) return;
      
      const finalMessageId = messageId || `msg_${Date.now()}_${userId}_${Math.random().toString(36).slice(2)}`;
      
      const now = new Date();
      // ✅ FIXED: Safe handling of null with optional chaining (?.)
    const isDuplicate = room.chatHistory.some(msg => 
      msg.userId?.toString() === userId.toString() &&  // ← Added ?. here
      msg.message === message.trim() && 
      (now - new Date(msg.timestamp)) < 1000
    );
      if (isDuplicate) {
        console.log('⚠️ Duplicate message prevented:', finalMessageId);
        return;
      }
      
      const chatMessage = {
        userId: new mongoose.Types.ObjectId(userId),
        username,
        message: message.trim(),
        type: 'user',
        timestamp: now,
        messageId: finalMessageId
      };
      
      room.chatHistory.push(chatMessage);
      
      if (room.chatHistory.length > 500) {
        room.chatHistory = room.chatHistory.slice(-500);
      }
      
      await room.save();
      
      io.to(roomId).emit('new-message', chatMessage);
      
      console.log(`💬 ${username}: ${message}`);
      
    } catch (error) {
      console.error('Chat message error:', error);
    }
  });

  // ==================== STATUS UPDATE ====================
  socket.on('status-update', async ({ roomId, userId, username, status, isMuted, statusMessage }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;
      
      const participant = room.participants.find(p => p.userId.toString() === userId);
      if (participant) {
        if (status) participant.status = status;
        if (typeof isMuted === 'boolean') participant.isMuted = isMuted;
      }
      
      await room.save();
      
      const activeParticipants = room.participants.filter(p => p.isActive);
      
      io.to(roomId).emit('user-status-update', {
        userId,
        username,
        status,
        isMuted,
        statusMessage,
        participants: activeParticipants
      });
      
      if (statusMessage) {
        room.chatHistory.push({
          userId,
          username,
          message: statusMessage,
          type: 'system',
          timestamp: new Date()
        });
        await room.save();
      }
      
    } catch (error) {
      console.error('Status update error:', error);
    }
  });

  // ==================== TASK STARTED ====================
  socket.on('task-started', async ({ roomId, userId, taskTitle }) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;
    
    const participant = room.participants.find(p => p.userId.toString() === userId);
    if (participant) {
      // ✅ If resuming after pause, don't reset accumulated time
      if (!participant.hasActiveTask) {
        // First time starting (or resuming from pause)
        // Keep totalAccumulatedTime as is
        participant.taskStartTime = new Date();
        participant.totalPausedTime = 0;
      }
      
      participant.hasActiveTask = true;
    }
    
    await room.save();
    
    startTimerBroadcast(roomId);
    startParticipantBroadcast(roomId);
    
    console.log(`🎯 ${taskTitle} started by ${userId}`);
    
  } catch (error) {
    console.error('Task started error:', error);
  }
});
  // ==================== TASK COMPLETED ====================
 socket.on('task-completed', async ({ roomId, userId }) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;
    
    const participant = room.participants.find(p => p.userId.toString() === userId);
    if (participant) {
      participant.tasksCompleted += 1;  // ✅ Increment this
      
      // Also fetch actual count from tasks collection for accuracy
      const userTasks = await Task.find({ owner: userId });
      const totalTasks = userTasks.reduce((sum, t) => sum + (t.subTasks?.length || 0), 0);
      const completedTasks = userTasks.reduce((sum, t) => 
        sum + (t.subTasks?.filter(s => s.completed).length || 0), 0
      );
      
      participant.totalTasks = totalTasks;
      participant.tasksCompleted = completedTasks;
    }
    
    await room.save();
  } catch (error) {
    console.error('Task completion tracking error:', error);
  }
});
//==============TASK-PAUSED=============
socket.on('task-paused', async ({ roomId, userId }) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;
    
    const participant = room.participants.find(p => p.userId.toString() === userId);
    if (participant && participant.hasActiveTask && participant.taskStartTime) {
      // ✅ Save accumulated time when pausing
      const sessionTime = Date.now() - new Date(participant.taskStartTime).getTime();
      participant.totalAccumulatedTime = (participant.totalAccumulatedTime || 0) + sessionTime;
      
      participant.hasActiveTask = false;
      participant.taskStartTime = null;
      participant.totalPausedTime = 0;
    }
    
    await room.save();
    
    io.to(roomId).emit('participants-list-update', {
      participants: room.participants.filter(p => p.isActive),
      roomId: roomId,
      timestamp: Date.now()
    });
    
    console.log(`⏸️ Task paused by ${userId}, accumulated: ${participant?.totalAccumulatedTime}ms`);
    
  } catch (error) {
    console.error('Task pause error:', error);
  }
});

//================COLLOBORATION-TASKS===========

socket.on('collaboration-subtask-completed', async ({ roomId, taskId, subTaskId, userId, username }) => {
  try {
    const task = await CollaborationTask.findById(taskId);
    if (!task) {
      console.error('❌ Collab task not found:', taskId);
      return;
    }
    
    let userCompletion = task.completions.find(c => 
      c.userId.toString() === userId.toString()
    );
    
    if (!userCompletion) {
      userCompletion = {
        userId: new mongoose.Types.ObjectId(userId),
        username: username,
        avatar: username.charAt(0).toUpperCase(),
        completedSubTasks: [new mongoose.Types.ObjectId(subTaskId)],
        completedAt: null,
        totalTimeSpent: 0
      };
      task.completions.push(userCompletion);
    } else {
      const subTaskObjectId = new mongoose.Types.ObjectId(subTaskId);
      if (!userCompletion.completedSubTasks.find(id => id.toString() === subTaskId)) {
        userCompletion.completedSubTasks.push(subTaskObjectId);
      }
    }
    
    if (userCompletion.completedSubTasks.length === task.subTasks.length) {
      userCompletion.completedAt = new Date();
    }
    
    await task.save();
    
    io.to(roomId).emit('collab-task-progress-update', {
      taskId: taskId,
      userId: userId,
      username: username,
      completedCount: userCompletion.completedSubTasks.length,
      totalCount: task.subTasks.length,
      isFullyCompleted: userCompletion.completedSubTasks.length === task.subTasks.length,
      timestamp: Date.now()
    });
    
    console.log(`✅ ${username} completed collab subtask in ${roomId}`);
  } catch (error) {
    console.error('❌ Collab task update error:', error);
  }
});

socket.on('collaboration-task-created', async ({ roomId }) => {
  try {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) return;
    
    const tasks = await CollaborationTask.find({ 
      roomId: room._id,
      status: { $ne: 'archived' }
    })
      .sort({ createdAt: -1 });
    
    io.to(roomId).emit('collab-tasks-list-update', tasks);
    console.log(`📢 Broadcasted updated collab tasks for room: ${roomId}`);
  } catch (error) {
    console.error('❌ Error broadcasting collab tasks:', error);
  }
});

socket.on('collab-subtask-started', async ({ roomId, taskId, subTaskId, userId, username }) => {
  try {
    console.log(`▶️ ${username} started collab subtask in ${roomId}`);
    io.to(roomId).emit('collab-subtask-started', {
      taskId,
      subTaskId,
      userId,
      username
    });
  } catch (error) {
    console.error('❌ Error broadcasting collab subtask start:', error);
  }
});

socket.on('collab-subtask-paused', async ({ roomId, taskId, subTaskId, userId, username }) => {
  try {
    console.log(`⏸️ ${username} paused collab subtask in ${roomId}`);
    io.to(roomId).emit('collab-subtask-paused', {
      taskId,
      subTaskId,
      userId,
      username
    });
  } catch (error) {
    console.error('❌ Error broadcasting collab subtask pause:', error);
  }
});

  // ==================== SCREEN SHARE ====================
  socket.on('screen-share-start', async ({ roomId, userId, username }) => {
    try {
      console.log(`🖥️ ${username} started screen sharing in ${roomId}`);
      
      socket.to(roomId).emit('screen-share-started', {
        userId,
        username
      });
      
    } catch (error) {
      console.error('Screen share error:', error);
    }
  });

  socket.on('screen-share-stop', async ({ roomId, userId, username }) => {
    try {
      io.to(roomId).emit('screen-share-stopped', {
        userId,
        username
      });
    } catch (error) {
      console.error('Screen share stop error:', error);
    }
  });

  // ==================== AUDIO ====================
  const activeStreams = new Map();

  socket.on('audio-start', async ({ roomId, userId, username }) => {
    console.log(`🎤 ${username} started audio in ${roomId}`);
    activeStreams.set(userId, { roomId, username, socketId: socket.id });
    io.to(roomId).emit('user-audio-started', { userId, username });
  });

  socket.on('audio-stop', async ({ roomId, userId, username }) => {
    console.log(`🔇 ${username} stopped audio in ${roomId}`);
    activeStreams.delete(userId);
    io.to(roomId).emit('user-audio-stopped', { userId, username });
  });

  socket.on('audio-toggle', async ({ roomId, userId, username, isEnabled }) => {
    try {
      io.to(roomId).emit('user-audio-update', {
        userId,
        username,
        isEnabled
      });
    } catch (error) {
      console.error('Audio toggle error:', error);
    }
  });

  // ==================== WEBRTC ====================
  socket.on('webrtc-offer', ({ roomId, targetUserId, offer, userId }) => {
    const target = Array.from(io.sockets.sockets.values())
      .find(s => s.userId === targetUserId);
    
    if (target) {
      target.emit('webrtc-offer', { userId, offer });
    }
  });

  socket.on('webrtc-answer', ({ roomId, targetUserId, answer, userId }) => {
    const target = Array.from(io.sockets.sockets.values())
      .find(s => s.userId === targetUserId);
    
    if (target) {
      target.emit('webrtc-answer', { userId, answer });
    }
  });

  socket.on('webrtc-ice-candidate', ({ roomId, targetUserId, candidate, userId }) => {
    const target = Array.from(io.sockets.sockets.values())
      .find(s => s.userId === targetUserId);
    
    if (target) {
      target.emit('webrtc-ice-candidate', { userId, candidate });
    }
  });

  socket.on('set-user-id', (userId) => {
    socket.userId = userId;
  });

  // ==================== DISCONNECT ====================
  socket.on('disconnect', async () => {
    console.log('🔴 User disconnected:', socket.id);
    
    for (const [userId, socketId] of activeConnections.entries()) {
      if (socketId === socket.id) {
        activeConnections.delete(userId);
        
        try {
          const rooms = await Room.find({ 'participants.userId': userId });
          for (const room of rooms) {
            const participant = room.participants.find(p => p.userId.toString() === userId);
            if (participant && participant.isActive) {
              participant.isActive = false;
              
              if (participant.sessionStartTime) {
                const sessionDuration = Date.now() - new Date(participant.sessionStartTime).getTime();
                participant.totalStudyTime += sessionDuration;
              }
              
              await room.save();
              
              io.to(room.roomId).emit('user-left', {
                userId,
                username: participant.username,
                participants: room.participants.filter(p => p.isActive)
              });
              
              const hasActive = room.participants.some(p => p.isActive);
              if (!hasActive) {
                stopTimerBroadcast(room.roomId);
                stopParticipantBroadcast(room.roomId);
              }
            }
          }
        } catch (error) {
          console.error('Disconnect cleanup error:', error);
        }
        
        break;
      }
    }
  });


}); // ✅ PROPER CLOSING OF io.on('connection')

// ==================== CLEANUP ON SHUTDOWN ====================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up intervals...');
  
  roomTimerIntervals.forEach((interval) => {
    clearInterval(interval);
  });
  roomTimerIntervals.clear();
  
  roomParticipantIntervals.forEach((interval) => {
    clearInterval(interval);
  });
  roomParticipantIntervals.clear();
  
  console.log('✅ All intervals cleared');
});

// ==================== DATABASE CONNECTION & SERVER START ====================

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startDailyCleanupScheduler();
    
    const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
    const MAX_PORT_ATTEMPTS = 10;

    const tryListen = (port, attempt = 0) => new Promise((resolve, reject) => {
      const onError = (err) => {
        httpServer.removeListener('error', onError);
        if (err && err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
          const nextPort = port + 1;
          console.warn(`⚠️ Port ${port} in use, trying ${nextPort} (attempt ${attempt + 1})`);
          setTimeout(() => {
            tryListen(nextPort, attempt + 1).then(resolve).catch(reject);
          }, 250);
        } else {
          reject(err);
        }
      };

      httpServer.once('error', onError);
      httpServer.listen(port, () => {
        httpServer.removeListener('error', onError);
        console.log(`🚀 Server running on port ${port}`);
        resolve(port);
      });
    });

    tryListen(DEFAULT_PORT).catch((err) => {
      console.error('❌ Failed to start HTTP server:', err && err.message ? err.message : err);
      if (err && err.code === 'EADDRINUSE') {
        console.error('Port conflict remains after retries. Either free the port or set PORT env to a different value.');
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });  
  });
});