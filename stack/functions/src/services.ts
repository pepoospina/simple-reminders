import { RequestHandler, Request } from 'express';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface Services {
  reminders: RemindersService;
}

export interface ServicesConfig {
  dynamo: {
    region: string;
    endpoint?: string;
  };
}

const DEBUG = true;

export const createServices = (config: ServicesConfig): Services => {
  const repo = new RemindersRepository(config.dynamo);
  return {
    reminders: new RemindersService(repo),
  };
};



export const attachServices: RequestHandler = async (request, response, next) => {
  const config = process.env.AWS_SAM_LOCAL === 'true' ? {
    region: process.env.AWS_REGION as string,
    endpoint: process.env.DYNAMO_ENDPOINT,
  } : {
    region: process.env.AWS_REGION as string,
  };
  
  if (DEBUG) console.log('Attach services', process.env);

  (request as any).services = createServices({
    dynamo: config,
  });

  return next();
};

export const getServices = (request: Request) => {
  const services = (request as any).services as Services;
  if (!services) {
    throw new Error(`Services not found`);
  }
  return services;
};
