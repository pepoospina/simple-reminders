import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

export interface EmailServiceConfig {
  region: string;
  from: string;
}

export class EmailService {
  client: SESClient;

  constructor(protected config: EmailServiceConfig) {
    this.client = new SESClient({ region: config.region });
  }

  buildEmailBody(to: string, reminder: string) {
    return {
      html: `
    <h1>Reminder!</h1>
    <p>${reminder}</p>
    <p></p>
    <p>Best regards,</p>
    <p>Simple Reminders</p>
    `,
      text: `Reminder!\n${reminder}\n\nBest regards,\nSimple Reminders`,
    };
  }

  sendEmail(to: string, reminder: string) {
    const data = this.buildEmailBody(to, reminder);
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: 'Reminder' },
        Body: {
          Html: { Data: data.html },
          Text: { Data: data.text },
        },
      },
      Source: this.config.from,
    });

    return this.client.send(command);
  }
}
