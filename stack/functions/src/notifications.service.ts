import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { RemindersService } from './reminders.service';
import { EmailService } from './email.service';
import { ONE_MINUTE, TimeService } from './time.service';
import { STATUS } from './types/reminders.types';

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
    const before = this.time.now() + 10 * ONE_MINUTE;
    const pending = await this.reminders.repo.getReminders({ before, status: STATUS.PENDING });

    await Promise.all(
      pending.map(async (reminder) => {
        const res = await this.emailService.sendEmail(this.config.EMAIL_TO, reminder.content);

        this.reminders.repo.updateReminder({
          id: reminder.id,
          status: res.$metadata.httpStatusCode === 200 ? STATUS.DELIVERED : STATUS.FAILED,
        });
      }),
    );
  }
}
