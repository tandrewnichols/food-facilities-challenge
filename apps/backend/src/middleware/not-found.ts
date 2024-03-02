import { Request } from 'express';
import createError from 'http-errors';

export const notFound = (req: Request) => {
  throw createError(404, 'Not Found', { url: req.originalUrl });
};
