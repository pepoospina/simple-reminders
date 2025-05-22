import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { RemindersService } from './reminders.service';
import { EmailService } from './email.service';
import { ONE_MINUTE, TimeService } from './time.service';
import { STATUS } from './types/reminders.types';

const DEBUG = true;
export interface NotificationsServiceConfig {
  EMAIL_TO: string;
}

export class NotificationsService {
  constructor(
    protected reminders: RemindersService,
    protected emailService: EmailService,
    protected time: TimeService,
    protected config: NotificationsServiceConfig,
  ) {}

  async sendRemindersNotifications() {
    if (DEBUG) console.log('Sending reminders notifications');

    const before = this.time.now() + 10 * ONE_MINUTE;
    const pending = await this.reminders.repo.getReminders({ before, status: STATUS.PENDING });

    if (DEBUG) console.log('Found', pending.length, 'pending reminders');

    return await Promise.all(
      pending.map(async (reminder) => {
        if (DEBUG) console.log('Sending reminder notification:', reminder.content);

        try {
          const res = await this.emailService.sendEmail(this.config.EMAIL_TO, reminder.content);
          const success = res.$metadata.httpStatusCode === 200;

          if (DEBUG) console.log('Reminder notification sent:', success);

          this.reminders.repo.updateReminder({
            id: reminder.id,
            status: success ? STATUS.DELIVERED : STATUS.FAILED,
          });

          return success;
        } catch (error) {
          console.error('Error sending reminder notification:', error);
          this.reminders.repo.updateReminder({
            id: reminder.id,
            status: STATUS.FAILED,
          });
          return false;
        }
      }),
    );
  }
}
