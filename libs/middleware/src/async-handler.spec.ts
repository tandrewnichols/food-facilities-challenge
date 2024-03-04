import { asyncHandler } from './async-handler';
import { Request, Response } from 'express';
import { getDebugInfoFromAxios } from '@logger/utils';
import z from 'zod';
import { when } from 'jest-when';

jest.mock('@logger/utils');

describe('lib/async-handler', () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      get: jest.fn().mockReturnValue('correlationId'),
    } as unknown as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    } as unknown as Response;
    next = jest.fn();

    (getDebugInfoFromAxios as jest.Mock).mockReturnValue({ hello: 'world' });
  });

  describe('with a zod schema', () => {
    let schema: z.ZodObject<any>;
    let fullReq: Request;
    let actualHandler: jest.Mock;

    beforeEach(() => {
      schema = z.object({
        params: z.object({
          id: z.string()
        })
      });

      fullReq = {
        get: jest.fn().mockReturnValue('correlationId'),
        params: {
          id: 'id'
        },
        query: {},
        body: {},
        headers: {}
      } as unknown as Request;

      actualHandler = jest.fn();

      when(actualHandler)
        .calledWith({
          get: expect.any(Function),
          params: {
            id: 'id'
          }
        }, res, expect.any(Function))
        .mockResolvedValue({ foo: 'bar' });
    });

    it('should pass a parsed request to the handler', async () => {
      const handler = asyncHandler<{ foo: string }>(actualHandler, schema);
      await handler(fullReq, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('an object is returned', () => {
    it('should call res.json', async () => {
      const handler = asyncHandler(async () => ({ foo: 'bar' }));

      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('a non-object is returned', () => {
    it('should call res.send', async () => {
      // Testing 0 since 0 is falsy
      const handler = asyncHandler(async () => 0);

      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(0);
    });
  });

  describe('null is returned', () => {
    it('should call res.send', async () => {
      const handler = asyncHandler(async () => null);

      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith();
    });
  });

  describe('a not ok response from /health-check', () => {
    it('should send status 207', async () => {
      req.originalUrl = '/health-check';

      const handler = asyncHandler(async () => ({
        ok: false,
      }));

      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(207);
      expect(res.json).toHaveBeenCalledWith({ ok: false });
    });
  });

  describe('status is already set', () => {
    it('should not reset the status', async () => {
      const handler = asyncHandler(async (request, response) => {
        // You'd never do this in a real route,
        // but calling res.status() does set
        // this internally, so I'm just simulating
        // that.
        response.statusCode = 201;
        return {
          foo: 'bar'
        };
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('nothing is returned', () => {
    it('should call next', async () => {
      const handler = asyncHandler(async () => undefined);

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('nothing is returned but the route called res.end or similar', () => {
    it('should basically do nothing', async () => {
      const handler = asyncHandler(async () => {
        (res as any).writableEnded = true;
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('next is called by the route (with no arguments)', () => {
    it('should basically do nothing', async () => {
      const handler = asyncHandler(async (request, response, nxt) => {
        nxt();
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('next is called by the route (with "route")', () => {
    it('should basically do nothing', async () => {
      const handler = asyncHandler(async (request, response, nxt) => {
        nxt('route');
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith('route');
    });
  });

  describe('next is called with an error', () => {
    it('should throw said error', async () => {
      const handler = asyncHandler(async (request, response, nxt) => {
        nxt(new Error('banana'));
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'banana',
      }));
    });
  });

  describe('an error is returned', () => {
    it('should throw said error', async () => {
      const handler = asyncHandler(async () => new Error('banana'));

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'banana',
      }));
    });
  });

  describe('an error is thrown', () => {
    it('should call next with that error', async () => {
      const handler = asyncHandler(async () => {
        throw new Error('banana');
      });

      await handler(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'banana',
      }));
    });
  });
});
