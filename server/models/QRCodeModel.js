import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  qrValue: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // Ensure userId is also converted to string
      if (ret.userId && ret.userId.toString) {
        ret.userId = ret.userId.toString();
      }
      return ret;
    }
  }
});

// Indexes for faster queries
qrCodeSchema.index({ userId: 1 });
qrCodeSchema.index({ id: 1 });

export const QRCodeModel = mongoose.model('QRCode', qrCodeSchema);

