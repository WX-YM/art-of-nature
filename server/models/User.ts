import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    hashedPassword: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
