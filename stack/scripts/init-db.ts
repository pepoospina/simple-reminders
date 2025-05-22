import { resetDB } from '../functions/tests/unit/test.db.utils';

// Set dummy AWS credentials for local DynamoDB
process.env.AWS_ACCESS_KEY_ID = 'accessKeyId';
process.env.AWS_SECRET_ACCESS_KEY = 'secretAccessKey';

console.log('Initializing database...');
resetDB()
  .then(() => {
    console.log('Database initialization completed successfully');
  })
  .catch((error) => {
    console.error('Error initializing database:', error);
    process.exit(1);
  });
