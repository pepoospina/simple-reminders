import { RequestHandler, Request } from 'express';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

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
  const config = {
    region: process.env.AWS_REGION || 'eu-north-1',
    endpoint: process.env.DYNAMO_ENDPOINT,
  };

  if (DEBUG) console.log('Attach services', config);

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
