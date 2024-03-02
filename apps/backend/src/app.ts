import express from 'express';
import api from './api';
import { handleError } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { createRouteLogger } from './middleware/logger';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(createRouteLogger);

app.use('/api', api);

app.use(notFound);
app.use(handleError);

export default app;
