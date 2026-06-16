//roomRoutes.js
import express from 'express';
import crypto from 'crypto';
import Room from '../models/room.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

// @route   POST /api/rooms/create
// @desc    Create a new private study room
router.post('/create', protect, async (req, res) => {
  try {
    const { name, password, maxParticipants } = req.body;
    const roomId = crypto.randomBytes(8).toString('hex');
    
    const room = await Room.create({
      roomId,
      name: name || `${req.user.username}'s Study Room`,
      creator: req.user._id,
      type: 'private',
      password: password || null,
      maxParticipants: maxParticipants || 10
    });
    
    const inviteLink = `${process.env.FRONTEND_URL}/html/room.html?id=${roomId}`;
    
    res.json({ 
      success: true, 
      roomId, 
      inviteLink,
      message: 'Room created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/rooms/:roomId
// @desc    Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('creator', 'username fullName avatar');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ 
      success: true, 
      room: {
        roomId: room.roomId,
        name: room.name,
        creator: room.creator,
        type: room.type,
        participants: room.participants.filter(p => p.isActive),
        currentTasks: room.currentTasks,
        maxParticipants: room.maxParticipants,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/rooms/:roomId/join
// @desc    Join a room (check password if required)
router.post('/:roomId/join', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Check password if room is password protected
    if (room.password && room.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Check if room is full
    const activeParticipants = room.participants.filter(p => p.isActive).length;
    if (activeParticipants >= room.maxParticipants) {
      return res.status(403).json({ success: false, message: 'Room is full' });
    }
    
    res.json({ 
      success: true, 
      message: 'Authorized to join room',
      roomData: {
        roomId: room.roomId,
        name: room.name,
        creator: room.creator
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/rooms/public
// @desc    Get all public rooms with real-time data
router.get('/public', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ type: 'public' })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 });
    
    const roomsWithStats = rooms.map(room => ({
      roomId: room.roomId,
      name: room.name,
      creator: room.creator,
      activeParticipants: room.participants.filter(p => p.isActive).length,
      maxParticipants: room.maxParticipants,
      createdAt: room.createdAt
    }));
    
    res.json({ success: true, rooms: roomsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/rooms/stats
// @desc    Get category-wise room statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ type: 'public' });
    
    // Count active users in each category
    const stats = {
      homework: 0,
      coa: 0,
      testPrep: 0,
      dsa: 0,
      math: 0,
      dstl: 0
    };
    
    rooms.forEach(room => {
      const activeCount = room.participants.filter(p => p.isActive).length;
      const roomName = room.name.toLowerCase();
      
      if (roomName.includes('homework')) stats.homework += activeCount;
      else if (roomName.includes('coa')) stats.coa += activeCount;
      else if (roomName.includes('test') || roomName.includes('exam')) stats.testPrep += activeCount;
      else if (roomName.includes('dsa') || roomName.includes('data structure')) stats.dsa += activeCount;
      else if (roomName.includes('math')) stats.math += activeCount;
      else if (roomName.includes('dstl') || roomName.includes('lab')) stats.dstl += activeCount;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// @route   GET /api/rooms/:roomId/timer-state
// @desc    Get user's timer state
router.get('/:roomId/timer-state', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    const participant = room.participants.find(p => p.userId.toString() === req.user._id.toString());
    
    res.json({
      success: true,
      timerState: participant ? {
        taskStartTime: participant.taskStartTime,
        totalPausedTime: participant.totalPausedTime,
        hasActiveTask: participant.hasActiveTask
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/rooms/:roomId/timer-state
// @desc    Save user's timer state
router.post('/:roomId/timer-state', protect, async (req, res) => {
  try {
    const { userId, taskStartTime, totalPausedTime, hasActiveTask } = req.body;
    
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    const participant = room.participants.find(p => p.userId.toString() === userId);
    
    if (participant) {
      participant.taskStartTime = taskStartTime;
      participant.totalPausedTime = totalPausedTime;
      participant.hasActiveTask = hasActiveTask;
      
      await room.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;