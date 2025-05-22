import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import cors from 'cors';
import express, { Router, Application } from 'express';
import serverlessExpress from '@codegenie/serverless-express';
import { attachServices } from './src/services';
import { router } from './router';
import { cronJob } from './cron.job';
import { createServices } from './src/services';
import { config } from './config';

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

const app = buildApp(router);



export const api = serverlessExpress({ app });
export const cron = cronJob(createServices(config));