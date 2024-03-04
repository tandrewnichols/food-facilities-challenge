import express from 'express';
import api from './api';
import { handleError } from '@middleware/error-handler';
import { notFound } from '@middleware/not-found';
import { createRouteLogger } from '@middleware/logger';
import { asyncHandler } from '@middleware/async-handler';
import { healthCheck } from '@middleware/health-check';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(asyncHandler(createRouteLogger));

app.use('/health-check', healthCheck);
app.use('/api', api);

app.use(notFound);
app.use(handleError);

export default app;
