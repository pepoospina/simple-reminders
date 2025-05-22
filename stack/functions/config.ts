import { ServicesConfig } from './src/services';

export const config: ServicesConfig = {
  dynamo:
    process.env.AWS_SAM_LOCAL === 'true'
      ? {
          region: process.env.AWS_REGION as string,
          endpoint: process.env.DYNAMO_ENDPOINT,
        }
      : {
          region: process.env.AWS_REGION as string,
        },
  email: {
    region: process.env.AWS_REGION as string,
    from: process.env.EMAIL_FROM as string,
  },
  notifications: {
    EMAIL_TO: process.env.EMAIL_TO as string,
  },
};
