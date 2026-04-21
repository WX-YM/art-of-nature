import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const SiteVisitModel = mongoose.models.SiteVisit || mongoose.model('SiteVisit', siteVisitSchema);
