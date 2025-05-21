import { expect, describe, it, beforeAll } from '@jest/globals';
import { createServices } from '../../src/services';
import { resetDB } from './db.utils';

describe('Create reminder', function () {
  const services = createServices({
    dynamo: {
      region: 'eu-north-1',
      endpoint: 'http://localhost:8000',
    },
  });

  beforeAll(async () => {
    await resetDB();
  });

  it('creates two reminders', async () => {
    const result1 = await services.reminders.repo.createReminder({
      content: 'test reminder 1',
      date: 1747820397000,
    });

    const result2 = await services.reminders.repo.createReminder({
      content: 'test reminder 2',
      date: 1747820497000,
    });

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
  });

  it('gets all reminders', async () => {
    const reminders = await services.reminders.repo.getReminders();
    expect(reminders.length).toBe(2);
  });
});
