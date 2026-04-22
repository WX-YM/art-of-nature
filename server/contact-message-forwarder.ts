import nodemailer from 'nodemailer';
import type { ContactMessageInput } from '../src/app/lib/contactMessage';

type MailTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
};

let cachedTransportConfig: MailTransportConfig | null | undefined;
let cachedTransporter: nodemailer.Transporter | null = null;

function readTransportConfig(): MailTransportConfig | null {
  if (cachedTransportConfig !== undefined) {
    return cachedTransportConfig;
  }

  const to = process.env.CONTACT_FORWARD_TO_EMAIL?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const from = (process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER)?.trim();

  if (!to || !host || !from) {
    cachedTransportConfig = null;
    return cachedTransportConfig;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = (process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || port === 465;

  cachedTransportConfig = {
    host,
    port,
    secure,
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS,
    from,
    to,
  };

  return cachedTransportConfig;
}

function getTransporter(config: MailTransportConfig) {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user
      ? {
          user: config.user,
          pass: config.pass,
        }
      : undefined,
  });

  return cachedTransporter;
}

function buildForwardedText(message: ContactMessageInput) {
  return [
    'New contact message received.',
    '',
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Phone: ${message.phone ?? 'Not provided'}`,
    `Project Type: ${message.projectType}`,
    '',
    'Message:',
    message.message,
  ].join('\n');
}

export async function autoForwardContactMessage(message: ContactMessageInput) {
  const config = readTransportConfig();

  if (!config) {
    return;
  }

  const transporter = getTransporter(config);

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: `New contact message from ${message.name}`,
    text: buildForwardedText(message),
    replyTo: message.email,
  });
}
