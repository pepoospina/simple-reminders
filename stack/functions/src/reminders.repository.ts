import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { CreateReminderPayload, Reminder } from './types/reminders.types';
import { createLocalDynamoClient } from './db.utils';

export class RemindersRepository {
  private readonly tableName = 'Reminders';
  private readonly client: DynamoDBDocumentClient;

  constructor(config: { region: string; endpoint?: string }) {
    const clientConfig = { ...config };

    // Add dummy credentials when using a local endpoint
    if (config.endpoint === 'http://localhost:8000') {
      this.client = createLocalDynamoClient();
    } else {
      const dbclient = new DynamoDBClient(clientConfig);
      this.client = DynamoDBDocumentClient.from(dbclient);
    }
  }

  async createReminder(reminder: CreateReminderPayload): Promise<Reminder> {
    const reminderItem: Reminder = {
      ...reminder,
      id: uuidv4(),
    };

    const params = {
      TableName: this.tableName,
      Item: reminderItem,
    };

    try {
      const res = await this.client.send(new PutCommand(params));
      if (res.$metadata.httpStatusCode !== 200) {
        throw new Error('Failed to create reminder');
      }
      return reminderItem;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw new Error('Failed to create reminder');
    }
  }

  async getReminders(): Promise<Reminder[]> {
    const params = {
      TableName: this.tableName,
    };

    try {
      const result = await this.client.send(new ScanCommand(params));
      return (result.Items as Reminder[]) || [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      throw new Error('Failed to get reminders');
    }
  }
}
