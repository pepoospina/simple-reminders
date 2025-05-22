import { expect, describe, it, beforeAll } from '@jest/globals';
import { createServices } from '../../src/services';
import { resetDB } from './test.db.utils';
import { Reminder, STATUS } from '../../src/types/reminders.types';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '../../src/time.service';

describe('Create reminder', function () {
  let createResults: Reminder[];
  const T0 = 1747820497000;

  const services = createServices({
    dynamo: {
      region: 'eu-north-1',
      endpoint: 'http://localhost:8000',
    },
    email: {
      from: 'test@example.com',
      region: 'eu-north-1',
    },
    notifications: {
      EMAIL_TO: 'test@example.com',
    },
  });

  beforeAll(async () => {
    await resetDB();
  });

  it('creates two reminders', async () => {
    createResults = await Promise.all(
      [T0 - ONE_DAY - ONE_HOUR, T0 + 11 * ONE_MINUTE, T0 + 1 * ONE_HOUR].map(
        async (date, ix) => {

          const result = await services.reminders.repo.createReminder({
            content: `test reminder ${ix}`,
            date,
          });

          if (date <= T0 + 10 * ONE_MINUTE) {
            await services.reminders.repo.updateReminder({
              id: result.id,
              status: STATUS.DELIVERED,
            });
          }

          return result;
        }
      ),
    );

    createResults.forEach((result) => expect(result.id).toBeDefined());
  });

  it('gets all reminders', async () => {
    const reminders = await services.reminders.repo.getReminders();
    expect(reminders.length).toBe(3);
  });

  it('gets some reminders', async () => {
    const reminders = await services.reminders.repo.getReminders({
      before: T0 + 5 * ONE_MINUTE + 10 * ONE_MINUTE,
      status: STATUS.PENDING,
    });

    expect(reminders.length).toBe(1);
    expect(reminders[0].id).toEqual(createResults[1].id);
  });
});
