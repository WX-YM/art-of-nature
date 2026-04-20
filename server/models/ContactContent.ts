import mongoose from 'mongoose';

const contactContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    nameLabel: { type: String, required: true },
    namePlaceholder: { type: String, required: true },
    emailLabel: { type: String, required: true },
    emailPlaceholder: { type: String, required: true },
    projectTypeLabel: { type: String, required: true },
    projectDefaultOption: { type: String, required: true },
    projectOptions: [{ type: String, required: true }],
    messageLabel: { type: String, required: true },
    messagePlaceholder: { type: String, required: true },
    submitText: { type: String, required: true },
    directContactLabel: { type: String, required: true },
    directContacts: [
      {
        href: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ContactContentModel =
  mongoose.models.ContactContent || mongoose.model('ContactContent', contactContentSchema);
