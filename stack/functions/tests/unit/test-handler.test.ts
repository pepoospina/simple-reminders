import { expect, describe, it, beforeAll } from '@jest/globals';
import { createServices } from '../../src/services';
import { resetDB } from './test.db.utils';
import { Reminder, STATUS } from '../../src/types/reminders.types';

const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;

describe('Create reminder', function () {
  let createResults: Reminder[];
  const T0 = 1747820497000;

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
    createResults = await Promise.all(
      [T0 - ONE_DAY - ONE_HOUR, T0 + 11 * ONE_MINUTE, T0 + 1 * ONE_HOUR].map(
        async (date, ix) =>
          await services.reminders.repo.createReminder({
            content: `test reminder ${ix}`,
            date,
            status: date <= T0 + 10 * ONE_MINUTE ? STATUS.DELIVERED : STATUS.PENDING,
          }),
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
