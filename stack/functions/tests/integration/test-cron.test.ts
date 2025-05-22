import { expect, describe, it, beforeAll } from '@jest/globals';
import { createTestServices } from '../../src/services';
import { resetDB } from '../test.db.utils';
import { ONE_MINUTE } from '../../src/time.service';
import { TimeServiceMock } from '../../src/time.service.mock';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({
  path: './.env.test', // Path is relative to the current working directory (project root)
});

describe.only('Create reminder', function () {
  const T0 = 1747820497000;

  console.log('process.env.AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID);

  const services = createTestServices({
    dynamo: {
      region: 'eu-north-1',
      endpoint: 'http://localhost:8000',
    },
    email: {
      from: 'test@example.com',
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    },
    notifications: {
      EMAIL_TO: 'test@example.com',
    },
  });

  const time = services.time as TimeServiceMock;

  beforeAll(async () => {
    await resetDB();
  });

  it('creates reminder', async () => {
    time.setNow(T0);

    const result = await services.reminders.repo.createReminder({
      content: `test reminder`,
      date: T0 + 15 * ONE_MINUTE,
    });

    expect(result.id).toBeDefined();
  });

  it('wont send notifications', async () => {
    const res = await services.notifications.sendRemindersNotifications();
    expect(res.filter((r) => r).length).toBe(0);
  });

  it('send notification', async () => {
    time.setNow(T0 + 8 * ONE_MINUTE);

    const res = await services.notifications.sendRemindersNotifications();
    expect(res.filter((r) => r).length).toBe(1);
  });
});
