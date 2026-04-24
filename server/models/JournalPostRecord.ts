import mongoose from 'mongoose';

const journalPostRecordSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    publishedAt: { type: String, required: true, trim: true },
    featured: { type: Boolean, required: true, default: false },
    published: { type: Boolean, required: true, default: true },
    coverImageUrl: { type: String, required: true, trim: true },
    coverImageAlt: { type: String, required: true, trim: true },
    galleryImageUrls: { type: [String], required: true, default: [] },
    body: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

journalPostRecordSchema.index({ rank: 1, publishedAt: -1, title: 1 });

export const JournalPostRecordModel =
  mongoose.models.JournalPostRecord ||
  mongoose.model('JournalPostRecord', journalPostRecordSchema);
