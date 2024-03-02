const origVal = process.env.RESPONSE_DEBUG_INFO;
process.env.RESPONSE_DEBUG_INFO = undefined;

import { ErrorHandler, createError } from './error-handler';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { HttpStatusCode } from 'axios';
import * as yup from 'yup';
import z from 'zod';
import { Logger } from 'winston';
import { Prisma } from '@prisma/client';
import { PrismaError } from 'prisma-error-enum';

afterAll(() => {
  process.env.RESPONSE_DEBUG_INFO = origVal;
});

describe('The Error Handler', () => {
  let subject: ErrorHandler;
  const { res, next, clearMockRes } = getMockRes();
  const mockReq = getMockReq();
  const mockRes = res;
  let fakeError = new Error();

  beforeEach(() => {
    subject = new ErrorHandler();
    fakeError = new Error();
    mockReq.logger = {
      error: jest.fn()
    } as unknown as Logger;
  });

  afterEach(() => {
    clearMockRes();
  });

  describe('with a clerk unauthenticated message', () => {
    it('should return a 401 Unauthorized', () => {
      // Arrange
      fakeError.message = 'Unauthenticated';
      const EXPECTED_ERROR_MESSAGE = 'Unauthorized';

      // Act
      subject.handleError(fakeError, mockReq, mockRes, next);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.Unauthorized);
      expect(mockRes.json).toHaveBeenCalledWith({ message: EXPECTED_ERROR_MESSAGE });
    });
  });

  describe('with an http error', () => {
    it('should return the status code of the error if present', () => {
      subject.handleError(createError(418, 'I\'m a teapot'), mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(418);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'I\'m a teapot' }));
    });
  });

  describe('prisma errors', () => {
    describe('with a record not found error', () => {
      it('should return a 404', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Record not Found', {
          code: PrismaError.RecordsNotFound,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Record Not Found' }));
      });
    });

    describe('with a record does not exist error', () => {
      it('should return a 404', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Record does not exist', {
          code: PrismaError.RecordDoesNotExist,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Record Not Found' }));
      });
    });

    describe('with a related record not found error', () => {
      it('should return a 404', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Related record not found', {
          code: PrismaError.RelatedRecordNotFound,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Record Not Found' }));
      });
    });

    describe('with a required connected record not found  error', () => {
      it('should return a 404', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Required connected record not found', {
          code: PrismaError.RequiredConnnectedRecordsNotFound,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Record Not Found' }));
      });
    });

    describe('with a unique constraint violation error', () => {
      it('should return a 400', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Unique Constraint Violation', {
          code: PrismaError.UniqueConstraintViolation,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Request' }));
      });
    });

    describe('with a missing required value error', () => {
      it('should return a 400', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('Missing required value', {
          code: PrismaError.MissingRequiredValue,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad Request' }));
      });
    });

    describe('with some other prisma error', () => {
      it('should return a 500', () => {
        subject.handleError(new Prisma.PrismaClientKnownRequestError('some error', {
          code: PrismaError.CannotRollBackANotFailedMigration,
          clientVersion: '25',
          meta: {
            cause: 'record not found',
          },
          batchRequestIdx: 2,
        }), mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal Server Error' }));
      });
    });
  });

  describe('with a yup validation error', () => {
    it('should return a 400', async () => {
      try {
        await yup.object({ foo: yup.string().required() }).validate({ bar: 43 });
      } catch (e) {
        subject.handleError(e as Error, mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bad Request' });
      }
    });
  });

  describe('with a zod validation error', () => {
    it('should return a 400', async () => {
      try {
        z.object({ foo: z.string() }).parse({ foo: 12 });
      } catch (e) {
        subject.handleError(e as Error, mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bad Request' });
      }
    });
  });

  describe('with some other kind of error', () => {
    it('should throw a 500 when an error', () => {
      // Arrange
      fakeError.message = 'Something has gone horribly wrong.';

      // Act
      subject.handleError(fakeError, mockReq, mockRes, next);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(mockRes.json).toHaveBeenCalledWith({ message: fakeError.message });
    });
  });
});
