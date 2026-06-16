import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  password: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['homework', 'coa', 'test-prep', 'dsa', 'math', 'dstl', 'general'],
    default: 'general'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    avatar: String,
    email: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['studying', 'break', 'urgent', 'offline'],
      default: 'studying'
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    taskStartTime: Date,
    totalPausedTime: {
      type: Number,
      default: 0
    },
      totalAccumulatedTime: { type: Number,
         default: 0 },  // ✅ ADD THIS

    hasActiveTask: {
      type: Boolean,
      default: false
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    sessionStartTime: {
      type: Date,
      default: Date.now
    },
    totalStudyTime: {
      type: Number,
      default: 0
    }
  }],
  currentTasks: [{
    userId: String,
    taskTitle: String,
    startedAt: Date,
    ytLink: String,
    pdfLink: String,
    imgPath: String
  }],
  collaborationTasks: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'CollaborationTask'
}],
  // ✅ FIX: chatHistory.userId should be Mixed, not ObjectId
  chatHistory: [{
    userId: {
      type: mongoose.Schema.Types.Mixed,  // ✅ CHANGED FROM: mongoose.Schema.Types.ObjectId
      required: false  // ✅ CHANGED FROM: not required (implicit)
    },
    username: String,
    message: String,
    type: {
      type: String,
      enum: ['user', 'system'],
      default: 'user'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageId: String
  }],
  
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowBreaks: {
      type: Boolean,
      default: true
    },
    enforceStudyTime: {
      type: Boolean,
      default: false
    },
    minStudyTime: {
      type: Number,
      default: 25
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

roomSchema.index({ type: 1, createdAt: -1 });
roomSchema.index({ 'participants.userId': 1 });
roomSchema.index({ category: 1 });

roomSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default mongoose.model('Room', roomSchema);