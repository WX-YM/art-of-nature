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
  await ContactMessageModel.create({
    name: input.name,
    email: input.email,
    projectType: input.projectType,
    message: input.message,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });
}
