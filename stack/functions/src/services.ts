import { RequestHandler, Request } from 'express';
import { RemindersService } from './reminders.service';
import { RemindersRepository } from './reminders.repository';

import dotenv from 'dotenv';
import { config } from '../config';
import { TimeService } from './time.service';
import { EmailService, EmailServiceConfig } from './email.service';
import { NotificationsService, NotificationsServiceConfig } from './notifications.service';

// Load environment variables from .env file
dotenv.config();

export interface Services {
  reminders: RemindersService;
  time: TimeService;
  email: EmailService;
  notifications: NotificationsService;
}

export interface ServicesConfig {
  dynamo: {
    region: string;
    endpoint?: string;
  };
  email: EmailServiceConfig;
  notifications: NotificationsServiceConfig;
}

const DEBUG = true;

export const createServices = (config: ServicesConfig): Services => {
  const repo = new RemindersRepository(config.dynamo);
  const reminders = new RemindersService(repo);
  const time = new TimeService();
  const email = new EmailService(config.email);
  const notifications = new NotificationsService(reminders, email, time, config.notifications);

  return {
    reminders,
    time,
    email,
    notifications,
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
