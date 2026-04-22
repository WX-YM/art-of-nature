import type { ContactMessageInput } from '../src/app/lib/contactMessage';
import { ContactMessageModel } from './models/ContactMessage';

type ContactMessageMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

export async function createContactMessage(
  input: ContactMessageInput,
  metadata: ContactMessageMetadata
): Promise<void> {
  const payload = {
    name: input.name,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    projectType: input.projectType,
    message: input.message,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  };

  await ContactMessageModel.create(payload);
}
