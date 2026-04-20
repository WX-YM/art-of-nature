import { Schema, model, models } from 'mongoose';

const heroContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    headingLine1: { type: String, required: true },
    headingLine2: { type: String, required: true },
    description: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaHref: { type: String, required: true },
    backgroundImageUrl: { type: String, required: true },
    backgroundImageAlt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const HeroContentModel = models.HeroContent || model('HeroContent', heroContentSchema);
