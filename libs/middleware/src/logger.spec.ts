import { createRouteLogger } from './logger';
import { Request } from 'express';
import { when } from 'jest-when';
import { Logger } from 'winston';

jest.mock('@logger/logger');
import logger from '@logger/logger';

describe('logger', () => {
  describe('createRouteLogger', () => {
    let req: Request;

    beforeEach(() => {
      req = {
        originalUrl: '/foo/bar?baz=quux',
        query: {
          baz: 'quux',
        },
        method: 'get'
      } as unknown as Request;

      when(logger.child)
        .calledWith({
          url: '/foo/bar',
          query: {
            baz: 'quux',
          },
          method: 'get'
        })
        .mockReturnValue('logger' as unknown as Logger);
    });

    it('should create a child logger', () => {
      createRouteLogger(req);
      expect(req.logger).toBe('logger');
    });
  });
});
