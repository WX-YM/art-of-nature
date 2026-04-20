import { Schema, model, models } from 'mongoose';

const aboutContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    paragraph1: { type: String, required: true },
    paragraph2: { type: String, required: true },
    paragraph3: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageAlt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AboutContentModel = models.AboutContent || model('AboutContent', aboutContentSchema);
