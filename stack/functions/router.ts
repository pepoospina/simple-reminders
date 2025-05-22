import { Router } from "express";
import { createReminderController, deleteReminderController, getRemindersController } from "./src/reminders.controllers";

export const router = Router();

router.post('/reminders', createReminderController);
router.get('/reminders', getRemindersController);
router.delete('/reminders/:id', deleteReminderController);