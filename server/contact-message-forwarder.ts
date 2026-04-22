import nodemailer from 'nodemailer';
import type { ContactMessageInput } from '../src/app/lib/contactMessage';
import { ForwardingSettingsModel } from './models/ForwardingSettings';

type SmtpTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
};

function createSmtpTransporter(config: SmtpTransportConfig) {
  return nodemailer.createTransport({
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
}

function readEnvironmentTransportConfig(): SmtpTransportConfig | null {
  const to = process.env.CONTACT_FORWARD_TO_EMAIL?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const from = (process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER)?.trim();

  if (!to || !host || !from) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = (process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || port === 465;

  return {
    host,
    port,
    secure,
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS,
    from,
    to,
  };
}

async function sendWithGmailOAuth(message: ContactMessageInput) {
  const settings = await ForwardingSettingsModel.findOne<{ enabled?: boolean; forwardToEmail?: string; gmailAddress?: string; googleClientId?: string; googleClientSecret?: string; googleRefreshToken?: string }>({ key: 'contact-forwarding' }).lean();

  if (!settings?.enabled) {
    return false;
  }

  const forwardToEmail = settings.forwardToEmail?.trim();
  const gmailAddress = settings.gmailAddress?.trim();
  const googleClientId = settings.googleClientId?.trim();
  const googleClientSecret = settings.googleClientSecret?.trim();
  const googleRefreshToken = settings.googleRefreshToken?.trim();

  if (!forwardToEmail || !gmailAddress || !googleClientId || !googleClientSecret || !googleRefreshToken) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: gmailAddress,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
    },
  });

  await transporter.sendMail({
    from: gmailAddress,
    to: forwardToEmail,
    subject: `New contact message from ${message.name}`,
    text: buildForwardedText(message),
    replyTo: message.email,
  });

  return true;
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
  if (process.env.NODE_ENV === 'test' || process.argv.includes('--test')) {
    return;
  }

  const sentByGmailOAuth = await sendWithGmailOAuth(message);
  if (sentByGmailOAuth) {
    return;
  }

  const config = readEnvironmentTransportConfig();

  if (!config) {
    return;
  }

  const transporter = createSmtpTransporter(config);

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: `New contact message from ${message.name}`,
    text: buildForwardedText(message),
    replyTo: message.email,
  });
}
