import mongoose from 'mongoose';

const aboutContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    paragraph1: { type: String, required: true },
    paragraph2: { type: String, required: true },
    paragraph3: { type: String, required: true },
    focusPoints: [{ type: String, required: true }],
    processEyebrow: { type: String, required: true },
    processDescription: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageAlt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AboutContentModel =
  mongoose.models.AboutContent || mongoose.model('AboutContent', aboutContentSchema);
