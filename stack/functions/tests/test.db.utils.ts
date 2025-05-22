import { ListTablesCommand, DeleteTableCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { createLocalDynamoClient } from '../src/db.utils';

/**
 * Creates a DynamoDB client configured for local development
 */

/**
 * Resets the DynamoDB database by deleting the Reminders table if it exists
 * and then creating a new one
 */
export const resetDB = async (): Promise<void> => {
  const client = createLocalDynamoClient();

  try {
    // List existing tables
    const { TableNames } = await client.send(new ListTablesCommand({}));

    // Delete Reminders table if it exists
    if (TableNames?.includes('Reminders')) {
      await client.send(
        new DeleteTableCommand({
          TableName: 'Reminders',
        }),
      );
      console.log('Deleted existing Reminders table');
    }

    // Create new Reminders table with GSI for filtering
    await client.send(
      new CreateTableCommand({
        TableName: 'Reminders',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
          {
            AttributeName: 'date',
            AttributeType: 'N',
          },
          {
            AttributeName: 'status',
            AttributeType: 'S',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'DateIndex',
            KeySchema: [
              {
                AttributeName: 'status',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'date',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }),
    );

    console.log('Created new Reminders table');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};
