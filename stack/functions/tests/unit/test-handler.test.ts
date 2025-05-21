import { expect, describe, it } from '@jest/globals';
import { createServices } from '../../src/services';

describe('Create reminder', function () {
  const services = createServices({
    dynamo: {
      region: 'eu-north-1',
      endpoint: 'http://localhost:8000',
    },
  });

  it('verifies create', async () => {
    const result = await services.reminders.repo.createReminder({
      content: 'test reminder',
      date: 1747820397000,
    });

    expect(result).toBeDefined();
  });
});
