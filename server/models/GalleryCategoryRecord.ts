import mongoose from 'mongoose';

const galleryCategoryRecordSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    eyebrow: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

galleryCategoryRecordSchema.index({ rank: 1, name: 1 });

export const GalleryCategoryRecordModel =
  mongoose.models.GalleryCategoryRecord ||
  mongoose.model('GalleryCategoryRecord', galleryCategoryRecordSchema);
