import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

export interface EmailServiceConfig {
  region: string;
  from: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class EmailService {
  client: SESClient;

  constructor(protected config: EmailServiceConfig) {
    // When running locally or in tests, we need to provide credentials
    // even if they're dummy values for local testing
    this.client = new SESClient({
      region: config.region,
      credentials: config.credentials,
    });
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

  async sendEmail(to: string, reminder: string) {
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
