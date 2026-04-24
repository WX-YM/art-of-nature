import test from 'node:test';
import assert from 'node:assert/strict';
import { ForwardingSettingsModel } from '../server/models/ForwardingSettings';
import {
  autoForwardContactMessage,
  __test_setTransportFactory,
  __test_resetTransportFactory,
} from '../server/contact-message-forwarder';

test('autoForwardContactMessage returns early when NODE_ENV is test', async () => {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  await assert.doesNotReject(async () => {
    await autoForwardContactMessage({ name: 'A', email: 'a@b.com', projectType: 'P', message: 'Hi' });
  });

  process.env.NODE_ENV = prev;
});

test('autoForwardContactMessage sends via Gmail OAuth when forwarding settings present', async () => {
  const prevEnv = { ...process.env };

  // Ensure production-like environment
  process.env.NODE_ENV = 'production';

  // Mock ForwardingSettingsModel.findOne to return enabled gmail settings
  const originalFindOne = ForwardingSettingsModel.findOne;
  (ForwardingSettingsModel as unknown as { findOne: () => { lean: () => Promise<any> } }).findOne = () => ({
    lean: async () => ({
      enabled: true,
      forwardToEmail: 'forward@domain.test',
      gmailAddress: 'gmail@domain.test',
      googleClientId: 'cid',
      googleClientSecret: 'csecret',
      googleRefreshToken: 'rtoken',
    }),
  }) as any;

  // Inject a transport factory to capture config and calls
  let sentMail: any = null;
  __test_setTransportFactory((config: any) => {
    assert.equal(config.service, 'gmail');
    assert.equal(config.auth.type, 'OAuth2');

    return {
      sendMail: async (msg: any) => {
        sentMail = msg;
        return Promise.resolve({ accepted: [msg.to] });
      },
    } as any;
  });

  try {
    await autoForwardContactMessage({ name: 'Alice', email: 'alice@example.test', projectType: 'Furniture', message: 'Hello' });

    assert.ok(sentMail, 'Expected sendMail to be called');
    assert.equal(sentMail.from, 'gmail@domain.test');
    assert.equal(sentMail.to, 'forward@domain.test');
    assert.match(sentMail.text, /Name: Alice/);
  } finally {
    (ForwardingSettingsModel as unknown as { findOne: typeof originalFindOne }).findOne = originalFindOne;
    __test_resetTransportFactory();
    process.env = prevEnv;
  }
});

test('autoForwardContactMessage falls back to SMTP env config when gmail not used', async () => {
  const prevEnv = { ...process.env };
  process.env.NODE_ENV = 'production';

  // Mock ForwardingSettingsModel.findOne to return disabled
  const originalFindOne = ForwardingSettingsModel.findOne;
  (ForwardingSettingsModel as unknown as { findOne: () => { lean: () => Promise<any> } }).findOne = () => ({
    lean: async () => ({ enabled: false }),
  }) as any;

  // Set SMTP environment variables
  process.env.SMTP_HOST = 'smtp.test';
  process.env.SMTP_PORT = '2525';
  process.env.SMTP_FROM_EMAIL = 'from@test';
  process.env.CONTACT_FORWARD_TO_EMAIL = 'to@test';

  // Inject a transport factory to capture smtp config
  let sentMail: any = null;
  __test_setTransportFactory((config: any) => {
    assert.equal(config.host, 'smtp.test');
    assert.equal(config.port, 2525);

    return {
      sendMail: async (msg: any) => {
        sentMail = msg;
        return Promise.resolve({ accepted: [msg.to] });
      },
    } as any;
  });

  try {
    await autoForwardContactMessage({ name: 'Bob', email: 'bob@example.test', projectType: 'Lighting', message: 'Hey' });

    assert.ok(sentMail, 'Expected SMTP sendMail to be called');
    assert.equal(sentMail.from, 'from@test');
    assert.equal(sentMail.to, 'to@test');
    assert.match(sentMail.text, /Name: Bob/);
  } finally {
    (ForwardingSettingsModel as unknown as { findOne: typeof originalFindOne }).findOne = originalFindOne;
    __test_resetTransportFactory();
    process.env = prevEnv;
  }
});
