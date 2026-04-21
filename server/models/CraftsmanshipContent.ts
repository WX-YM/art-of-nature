import mongoose from 'mongoose';

const craftsmanshipContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    items: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CraftsmanshipContentModel =
  mongoose.models.CraftsmanshipContent || mongoose.model('CraftsmanshipContent', craftsmanshipContentSchema);
