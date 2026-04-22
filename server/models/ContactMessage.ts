import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    projectType: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'seen'], required: true, default: 'new' },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
