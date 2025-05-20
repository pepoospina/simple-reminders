import cors from 'cors';
import express, { RequestHandler, Router } from 'express';
import serverlessExpress from '@codegenie/serverless-express';

export const buildApp = (router?: express.Router): express.Application => {
    const app = express();

    app.use(express.json());
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

const controller: RequestHandler = async (req, res) => {
    res.status(200).send({
        success: true,
        data: 'hello world',
    });
};

export const router = Router();
router.get('/auth/me', controller);

const app = buildApp();
export const hanlder = serverlessExpress({ app });
