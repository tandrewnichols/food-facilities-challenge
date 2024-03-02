import { Request } from 'express';
import { asyncHandler } from './async-handler';
import z from 'zod';

export const validate = (schema: z.ZodObject<any>) => asyncHandler((req: Request) => {
  req.logger.debug({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  schema.strict().parse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
});
