import mongoose from 'mongoose';

const gallerySubcategoryRecordSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    categoryKey: { type: String, required: true, trim: true, index: true },
    categorySlug: { type: String, required: true, trim: true },
    categoryName: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

gallerySubcategoryRecordSchema.index({ categoryKey: 1, slug: 1 }, { unique: true });
gallerySubcategoryRecordSchema.index({ categoryKey: 1, rank: 1, name: 1 });

export const GallerySubcategoryRecordModel =
  mongoose.models.GallerySubcategoryRecord ||
  mongoose.model('GallerySubcategoryRecord', gallerySubcategoryRecordSchema);
