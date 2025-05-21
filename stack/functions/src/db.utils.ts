import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const createLocalDynamoClient = (endpoint?: string) => {
  const client = new DynamoDBClient({
    region: 'eu-north-1',
    endpoint: endpoint || 'http://localhost:8000',
    credentials: {
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    },
  });

  return DynamoDBDocumentClient.from(client);
};
