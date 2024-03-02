import { Request } from 'express';
import { notFound } from './not-found';

describe('lib/not-found', () => {
  it('should throw a 404', () => {
    const req = {
      originalUrl: '/foo/bar',
    } as Request;

    try {
      notFound(req);
    } catch (e) {
      expect(e).toEqual(expect.objectContaining({
        message: 'Not Found',
        url: '/foo/bar',
        status: 404,
      }));
    }
  });
});
