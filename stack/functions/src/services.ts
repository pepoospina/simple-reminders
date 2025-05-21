import { RequestHandler, Request } from 'express';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

export interface Services {
  reminders: RemindersService;
}

export const createServices = (config: {}): Services => {
  const repo = new RemindersRepository();
  return {
    reminders: new RemindersService(repo),
  };
};

export const attachServices: RequestHandler = async (request, response, next) => {
  (request as any).services = createServices({});

  return next();
};

export const getServices = (request: Request) => {
  const services = (request as any).services as Services;
  if (!services) {
    throw new Error(`Services not found`);
  }
  return services;
};
