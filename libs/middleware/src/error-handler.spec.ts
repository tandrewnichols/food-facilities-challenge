import { handleError } from './error-handler';
import { HttpStatusCode } from 'axios';
import createError from 'http-errors';
import z from 'zod';
import { Logger } from 'winston';
import { Request, Response, NextFunction } from 'express';
import { formatZodError } from '@utils/zod';
import { AxiosError } from 'axios';

describe('The Error Handler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      logger: {
        error: jest.fn()
      } as unknown as Logger
    } as unknown as Request;
    res = {
      status: jest.fn(),
      json: jest.fn()
    } as unknown as Response;

    (res.status as jest.Mock).mockReturnThis();
  });

  describe('with an http error', () => {
    it('should return the status code of the error if present', () => {
      handleError(createError(418, 'I\'m a teapot'), req, res, next);

      expect(res.status).toHaveBeenCalledWith(418);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'I\'m a teapot' }));
    });
  });

  describe('with a zod validation error', () => {
    it('should return a 400', async () => {
      try {
        z.object({ foo: z.string() }).parse({ foo: 12 });
      } catch (e) {
        handleError(e as Error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Request' }));
      }
    });
  });

  describe('with a formatted zod error', () => {
    it('should return a 400', async () => {
      try {
        z.object({ foo: z.string() }).parse({ foo: 12 });
      } catch (e) {
        handleError(formatZodError(e as z.ZodError), req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Request' }));
      }
    });
  });

  describe('with an axios error with a response', () => {
    it('should return a 400', async () => {
      handleError(
        Object.assign(new AxiosError('Banana'), {
          response: {
            data: {
              message: 'Failed'
            },
            status: 405
          }
        }),
        req, res, next
      );

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Failed' }));
    });
  });

  describe('with an axios error with a response', () => {
    it('should return a 400', async () => {
      handleError(
        Object.assign(new AxiosError('Banana'), {
          request: {}
        }),
        req, res, next
      );

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Service Unavailable' }));
    });
  });

  describe('with some other kind of error', () => {
    it('should throw a 500 when an error', () => {
      handleError(new Error('Something has gone horribly wrong.'), req, res, next);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something has gone horribly wrong.' }));
    });
  });
});
