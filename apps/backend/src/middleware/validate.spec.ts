import { Request, Response, NextFunction } from 'express';
import { validate, zodValidate } from './validate';
import * as yup from 'yup';
import { AsyncRequestHandler } from './async-handler';
import z from 'zod';

const fakeSchema = z.any();

jest.mock('./async-handler', () => ({
  asyncHandler: (fn: AsyncRequestHandler<typeof fakeSchema>) => fn
}));

describe('middleware/validate', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      logger: {
        debug: jest.fn(),
      },
      query: {},
      body: {},
      params: {}
    } as unknown as Request;

    res = {} as unknown as Response;
    next = jest.fn();
  });

  describe('.validate', () => {
    it('should validate the incoming request', async () => {
      const middleware = validate(yup.object({
        body: yup.object().required(),
        query: yup.object().required(),
        params: yup.object().required()
      }));

      await expect(middleware(req, res, next)).resolves.toEqual(undefined);
    });
  });

  describe('.zodValidate', () => {
    it('should validate the incoming request', async () => {
      const middleware = zodValidate(z.object({
        body: z.object({}),
        params: z.object({}),
        query: z.object({})
      }));

      expect(middleware(req, res, next)).toEqual(undefined);
    });
  });
});
