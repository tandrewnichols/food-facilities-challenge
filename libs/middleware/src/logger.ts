import { Request } from 'express';
import logger from '@logger/logger';

export const createRouteLogger = (req: Request) => {
  const [url] = req.originalUrl.split('?');
  const { query, method } = req;

  req.logger = logger.child({ url, query, method });
};
