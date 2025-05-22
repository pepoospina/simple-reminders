import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { CreateReminderPayload, Reminder, STATUS } from './types/reminders.types';
import { createLocalDynamoClient } from './db.utils';
import { TimeService } from './time.service';

const DEBUG = true;

export class RemindersRepository {
  private readonly tableName = 'Reminders';
  private readonly client: DynamoDBDocumentClient;

  constructor(config: { region: string; endpoint?: string }, protected time: TimeService) {
    const clientConfig = { ...config };

    // Add dummy credentials when using a local endpoint
    if (config.endpoint) {
      if (DEBUG) console.log('Using local DynamoDB endpoint:', config.endpoint);
      this.client = createLocalDynamoClient(config.endpoint);
    } else {
      const dbclient = new DynamoDBClient(clientConfig);
      this.client = DynamoDBDocumentClient.from(dbclient);
    }
  }

  async createReminder(reminder: CreateReminderPayload): Promise<Reminder> {
    const reminderItem: Reminder = {
      ...reminder,
      id: uuidv4(),
      status: STATUS.PENDING,
      createdAt: this.time.now(),
    };

    const params = {
      TableName: this.tableName,
      Item: reminderItem,
    };

    try {
      if (DEBUG) console.log('Creating reminder:', reminderItem);
      const res = await this.client.send(new PutCommand(params));
      if (DEBUG) console.log('Reminder created:', res);
      if (res.$metadata.httpStatusCode !== 200) {
        throw new Error('Failed to create reminder');
      }
      return reminderItem;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw new Error('Failed to create reminder');
    }
  }

  async getReminders(filters?: { before: number; status: string }): Promise<Reminder[]> {
    if (DEBUG) console.log('Getting reminders', filters ? `with filters: ${JSON.stringify(filters)}` : '');

    try {
      let reminders: Reminder[] = [];
      
      if (!filters) {
        const scanParams = {
          TableName: this.tableName,
        };

        const result = await this.client.send(new ScanCommand(scanParams));
        reminders = (result.Items as Reminder[]) || [];
      } else {
        const queryParams: any = {
          TableName: this.tableName,
          IndexName: 'DateIndex',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: {
            '#status': 'status',
            '#date': 'date',
          },
          ExpressionAttributeValues: {
            ':status': filters.status || 'PENDING', // Default to PENDING if not provided
          },
        };

        queryParams.KeyConditionExpression += ' AND #date <= :date';
        queryParams.ExpressionAttributeValues[':date'] = filters.before;

        const result = await this.client.send(new QueryCommand(queryParams));
        reminders = (result.Items as Reminder[]) || [];
      }
      
      // Sort reminders by createdAt in descending order (most recent first)
      return reminders.sort((a, b) => a.date - b.date);
    } catch (error) {
      console.error('Error getting reminders:', error);
      throw new Error('Failed to get reminders');
    }
  }

  async deleteReminder(id: string): Promise<void> {
    if (DEBUG) console.log('Deleting reminder:', id);
    const params = {
      TableName: this.tableName,
      Key: {
        id,
      },
    };

    try {
      await this.client.send(new DeleteCommand(params));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw new Error('Failed to delete reminder');
    }
  }
}
