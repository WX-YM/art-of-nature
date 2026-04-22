import mongoose from 'mongoose';

const galleryImageAssetSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
  },
  { _id: false }
);

const galleryPieceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    material: { type: String, required: true },
    note: { type: String, required: true },
    archiveCount: { type: Number, required: true, min: 1 },
    featured: { type: Boolean, required: false, default: false },
    image: { type: galleryImageAssetSchema, required: true },
    images: { type: [galleryImageAssetSchema], required: true, default: [] },
  },
  { _id: false }
);

const galleryCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eyebrow: { type: String, required: true },
    description: { type: String, required: true },
    subcategories: [{ type: String, required: true }],
  },
  { _id: false }
);

const galleryContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    previewEyebrow: { type: String, required: true },
    previewHeading: { type: String, required: true },
    previewDescription: { type: String, required: true },
    pageEyebrow: { type: String, required: true },
    pageHeading: { type: String, required: true },
    pageDescription: { type: String, required: true },
    categories: { type: [galleryCategorySchema], required: true, default: [] },
    pieces: { type: [galleryPieceSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

export const GalleryContentModel =
  mongoose.models.GalleryContent || mongoose.model('GalleryContent', galleryContentSchema);
