import assert from 'node:assert/strict';

import { getNotificationMode, prepareEmailDelivery, prepareSmsDelivery } from '@/lib/notifications/mode';

async function run() {
  const originalEnv = {
    NOTIFICATION_MODE: process.env.NOTIFICATION_MODE,
    NOTIFICATION_REDIRECT_EMAIL: process.env.NOTIFICATION_REDIRECT_EMAIL,
    NOTIFICATION_REDIRECT_PHONE: process.env.NOTIFICATION_REDIRECT_PHONE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Keep the guard fully local: no provider sends and no DB capture inserts.
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    process.env.NOTIFICATION_MODE = 'capture';
    assert.equal(getNotificationMode(), 'capture');
    const capturedEmail = await prepareEmailDelivery({
      to: 'customer@example.com',
      subject: 'Quote ready',
      html: '<p>$317.30</p>',
      provider: 'test',
    });
    assert.equal(capturedEmail.shouldSend, false);
    assert.equal(capturedEmail.accepted, true);

    const capturedSms = await prepareSmsDelivery({
      to: '+17205550199',
      message: 'Quote ready',
      provider: 'test',
    });
    assert.equal(capturedSms.shouldSend, false);
    assert.equal(capturedSms.accepted, true);

    process.env.NOTIFICATION_MODE = 'redirect';
    process.env.NOTIFICATION_REDIRECT_EMAIL = 'qa@example.com';
    process.env.NOTIFICATION_REDIRECT_PHONE = '+13105550123';
    const redirectedEmail = await prepareEmailDelivery({
      to: ['customer@example.com', 'team@example.com'],
      subject: 'Manual review',
      html: '<p>Please call</p>',
      provider: 'test',
    });
    assert.equal(redirectedEmail.shouldSend, true);
    assert.deepEqual(redirectedEmail.to, ['qa@example.com']);
    assert.equal(redirectedEmail.subject, '[Redirected] Manual review');
    assert.match(redirectedEmail.html, /Original recipient: customer@example.com, team@example.com/);

    const redirectedSms = await prepareSmsDelivery({
      to: '+17205550199',
      message: 'Please call',
      provider: 'test',
    });
    assert.equal(redirectedSms.shouldSend, true);
    assert.equal(redirectedSms.to, '+13105550123');
    assert.match(redirectedSms.message, /^REDIRECTED from \+17205550199:/);

    process.env.NOTIFICATION_MODE = 'redirect';
    delete process.env.NOTIFICATION_REDIRECT_EMAIL;
    const missingRedirectEmail = await prepareEmailDelivery({
      to: 'customer@example.com',
      subject: 'Safe fallback',
      html: '<p>No redirect configured</p>',
      provider: 'test',
    });
    assert.equal(missingRedirectEmail.shouldSend, false);
    assert.equal(missingRedirectEmail.accepted, true);

    process.env.NOTIFICATION_MODE = 'not-a-mode';
    assert.equal(getNotificationMode(), 'capture');

    console.log('Notification mode safety checks passed.');
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

run();
