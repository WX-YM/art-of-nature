import mongoose from 'mongoose';

const galleryImageAssetRecordSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
  },
  { _id: false }
);

const galleryItemRecordSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    categoryKey: { type: String, required: true, trim: true, index: true },
    categorySlug: { type: String, required: true, trim: true },
    categoryName: { type: String, required: true, trim: true },
    subcategoryKey: { type: String, required: true, trim: true, index: true },
    subcategorySlug: { type: String, required: true, trim: true },
    subcategoryName: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    note: { type: String, required: true, trim: true },
    archiveCount: { type: Number, required: true, min: 1 },
    featured: { type: Boolean, required: true, default: false },
    rank: { type: Number, required: true, default: 0, index: true },
    image: { type: galleryImageAssetRecordSchema, required: true },
    images: { type: [galleryImageAssetRecordSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

galleryItemRecordSchema.index({ categoryKey: 1, subcategoryKey: 1, rank: 1, title: 1 });

export const GalleryItemRecordModel =
  mongoose.models.GalleryItemRecord ||
  mongoose.model('GalleryItemRecord', galleryItemRecordSchema);
