import { Request, Response, NextFunction } from 'express';
import z from 'zod';

type RequestOrSchema<T> = T extends z.ZodSchema ? z.infer<T> : Request;

export type AsyncRequestHandler<Schema extends z.ZodSchema, ResponseType = any> = (req: RequestOrSchema<Schema>, res: Response, next: NextFunction) => ResponseType | Promise<ResponseType>;

const isObjectSchema = (schema: z.ZodSchema | z.ZodObject<any>): schema is z.ZodObject<any> => (schema as z.ZodObject<any>).extend !== undefined;

export const asyncHandler = <ResponseType = any>(fn: AsyncRequestHandler<typeof schema, ResponseType>, schema: z.ZodSchema = z.any()) => async (req: RequestOrSchema<typeof schema>, res: Response, next: NextFunction) => {
  try {
    let nextCalled = false;

    const fakeNext = (maybeErr: Error | string | undefined) => {
      if (maybeErr instanceof Error) {
        throw maybeErr;
      }

      nextCalled = true;
      next(maybeErr);
    };

    let data: ResponseType;

    if (isObjectSchema(schema)) {
      // Always add req.get to the schema so that we can access the trace-id in axios calls
      const newReq: z.infer<typeof schema> = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      data = await fn({ ...req, ...newReq }, res, fakeNext);
    } else {
      data = await fn(req, res, fakeNext);
    }

    // If we return an error instead of throwing it,
    // throw it here to handle it the same as other errors.
    // With generics, typescript should make this unnecessary
    // but I'm leaving it until we migrate existing routes
    // to use the generic types.
    if (data instanceof Error) {
      throw data;
    }

    if (data !== undefined && data !== res) {
      if (!res.statusCode) {
        res.status(200);
      }

      if (typeof data === 'object') {
        if (data === null) {
          res.end();
        } else {
          res.json(data);
        }
      } else {
        res.send(data);
      }
    } else if (!nextCalled && !res.writableEnded) {
      next();
    }
  } catch (error) {
    next(error);
  }
};
