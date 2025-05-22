import { RequestHandler, Request } from 'express';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

import dotenv from 'dotenv';
import { config } from '../config';
import { TimeService } from './time.service';

// Load environment variables from .env file
dotenv.config();

export interface Services {
  reminders: RemindersService;
  time: TimeService;
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
    time: new TimeService(),
  };
};

export const attachServices: RequestHandler = async (request, response, next) => {
  if (DEBUG) console.log('Attach services', config);

  (request as any).services = createServices(config);

  return next();
};

export const getServices = (request: Request) => {
  const services = (request as any).services as Services;
  if (!services) {
    throw new Error(`Services not found`);
  }
  return services;
};
