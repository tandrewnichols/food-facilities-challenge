/* eslint-disable @typescript-eslint/no-explicit-any *//* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, HttpStatusCode } from 'axios';
import { ZodError } from 'zod';
import { formatZodMessage, ValidationError } from '@utils/zod';
import { HttpError } from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import { getDebugInfoFromAxios } from '@logger/utils';

export enum ErrorMessages {
  UNAUTHORIZED = 'Unauthorized',
  BAD_REQUEST = 'Bad Request',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}

// Express doesn't know it's an error handler unless you include all 4 arguments
// here, but then typescript/eslint complains that you aren't using them.
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  try {
    let status = 500;
    let message: string;
    let debugInfo = {};

    if (err instanceof ZodError) {
      status = HttpStatusCode.BadRequest;
      message = ErrorMessages.BAD_REQUEST;
      debugInfo = { errors: err.issues, errorMessage: formatZodMessage(err) };
    } else if (err instanceof ValidationError) {
      status = HttpStatusCode.BadRequest;
      message = ErrorMessages.BAD_REQUEST;
      debugInfo = { errors: err.originalError.issues, errorMessage: err.message };
    } else if (err instanceof AxiosError) {
      debugInfo = getDebugInfoFromAxios(err) as object;

      if (err.response) {
        ({ message } = err.response.data || {});
        ({ status } = err.response);
      } else if (err.request) {
        status = HttpStatusCode.ServiceUnavailable;
        message = 'Service Unavailable';
      }
    } else {
      status = (err as HttpError).status || HttpStatusCode.InternalServerError;
      message = err.message || ErrorMessages.INTERNAL_SERVER_ERROR;
    }

    const { expose = process.env.EXPOSE_DEBUG_INFO, ...errProps } = err instanceof AxiosError ? {} : err as HttpError;

    const responseData = {
      ...errProps,
      debugInfo,
      message,
      status,
      statusCode: status,
    };

    req.logger.error({
      ...responseData,
      stack: err.stack,
    });

    res.status(status).json(expose ? responseData : { message });
  } catch (e) {
    req?.logger?.error(`Something went wrong in error-handler: it threw ${ (e as Error).message }`);
    res.status(500).json({ message: 'Unexpected Error' });
  }
};
