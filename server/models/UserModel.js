import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ email: 1 });

export const UserModel = mongoose.model('User', userSchema);

