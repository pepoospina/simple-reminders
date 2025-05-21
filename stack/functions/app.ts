import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import cors from 'cors';
import express, { Router, Application } from 'express';
import serverlessExpress from '@codegenie/serverless-express';
import { createReminderController, getRemindersController, deleteReminderController } from './src/reminders.controllers';
import { attachServices } from './src/services';

export const buildApp = (router?: Router): Application => {
    const app = express();

    app.use(express.json());
    app.use(attachServices);
    app.use(
        cors({
            origin: true,
        }),
    );

    if (router) {
        app.use(router);
    }

    return app;
};


export const router = Router();

router.post('/reminders', createReminderController);
router.get('/reminders', getRemindersController);
router.delete('/reminders/:id', deleteReminderController);

const app = buildApp(router);

export const handler = serverlessExpress({ app });
