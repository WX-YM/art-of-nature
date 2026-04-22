import mongoose from 'mongoose';

const forwardingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true, default: false },
    provider: { type: String, required: true, default: 'gmail_oauth' },
    forwardToEmail: { type: String, required: false },
    gmailAddress: { type: String, required: false },
    googleClientId: { type: String, required: false },
    googleClientSecret: { type: String, required: false },
    googleRefreshToken: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const ForwardingSettingsModel =
  mongoose.models.ForwardingSettings || mongoose.model('ForwardingSettings', forwardingSettingsSchema);
