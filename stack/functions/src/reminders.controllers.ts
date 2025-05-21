import { RequestHandler } from 'express';
import { object, number, string } from 'yup';
import { CreateReminderPayload } from './types/reminders.types';
import { getServices } from './services';

const createReminderSchema = object({
  content: string().required(),
  date: number().required(),
}).noUnknown(true);

export const createReminderController: RequestHandler = async (req, res) => {
  const payload = (await createReminderSchema.validate(req.body)) as CreateReminderPayload;
  const services = getServices(req);
  const reminder = await services.reminders.repo.createReminder(payload);

  res.json(reminder);
};

export const getRemindersController: RequestHandler = async (req, res) => {
  const services = getServices(req);
  const reminders = await services.reminders.repo.getReminders();

  res.json(reminders);
};

export const deleteReminderController: RequestHandler = async (req, res) => {
  const services = getServices(req);
  await services.reminders.repo.deleteReminder(req.params.id);

  res.json({});
};