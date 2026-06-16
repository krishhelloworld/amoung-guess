// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Auth
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: String,
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  // 🆕 TOKEN SYSTEM
  tokens: {
    available: {
      type: Number,
      default: 12
    },
    used: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 12
    },
    lastTokenRefill: {
      type: Date,
      default: Date.now
    }
  },

  // PDF Reading History - THIS IS WHAT YOU NEED
  pdfHistory: [{
    bookId: Number,
    title: String,
    author: String,
    genre: String,
    tag: String,
    
    // Progress tracking
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: Number,
    progressPercentage: {
      type: Number,
      default: 0
    },
    
    // Time tracking
    firstAccessed: {
      type: Date,
      default: Date.now
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    totalTimeSpent: {
      type: Number,
      default: 0  // in minutes
    },
    
    // Status
    completionStatus: {
      type: String,
      enum: ['not-started', 'reading', 'completed'],
      default: 'reading'
    },
    
    // PDF Reader Data (from pdfreader.html) - CLOUDINARY STORAGE
    readerData: {
      cloudinaryUrl: String,  // URL to JSON data in Cloudinary
      publicId: String,       // Cloudinary public ID for deletion
      lastSavedAt: Date,      // When data was last saved
      dataSize: Number        // Size in bytes
    }
  }],
  
  // Video History (from your lecture system)
  videoHistory: [{
    videoId: String,
    title: String,
    thumbnail: String,
    watchedDuration: Number,
    totalDuration: Number,
    lastWatched: Date,
    completed: Boolean
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);