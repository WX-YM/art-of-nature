import mongoose from 'mongoose';

const journalPostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true },
    publishedAt: { type: String, required: true },
    featured: { type: Boolean, required: false, default: false },
    published: { type: Boolean, required: true, default: true },
    coverImageUrl: { type: String, required: true },
    coverImageAlt: { type: String, required: true },
    galleryImageUrls: { type: [String], required: true, default: [] },
    body: { type: String, required: true },
  },
  { _id: false }
);

const journalContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    previewEyebrow: { type: String, required: true },
    previewHeading: { type: String, required: true },
    previewDescription: { type: String, required: true },
    pageEyebrow: { type: String, required: true },
    pageHeading: { type: String, required: true },
    pageDescription: { type: String, required: true },
    posts: { type: [journalPostSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

export const JournalContentModel =
  mongoose.models.JournalContent || mongoose.model('JournalContent', journalContentSchema);
