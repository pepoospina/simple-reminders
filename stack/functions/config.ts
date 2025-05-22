export const config = process.env.AWS_SAM_LOCAL === 'true' ? {dynamo : {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.DYNAMO_ENDPOINT,
  }} : {dynamo : {
    region: process.env.AWS_REGION as string,
  }};