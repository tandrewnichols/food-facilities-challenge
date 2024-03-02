import { Request, Response } from 'express';
import { asyncHandler } from './async-handler';

jest.mock('./async-handler');

beforeEach(() => {
  (asyncHandler as jest.Mock).mockImplementation((fn) => fn);
});

let healthCheck: any;

describe('Health Check Route handler', () => {
  beforeEach(async () => {
    ({ healthCheck } = await import('./health-check'));
  });

  it('should return a 200 status', async () => {
    // Arrange
    const successResponseBody = { ok: true, data: {}};

    const req = {} as Request;

    const res = {} as Response;

    const next = jest.fn();

    // Act
    await expect(healthCheck(req, res, next)).resolves.toEqual(successResponseBody);
  });
});

