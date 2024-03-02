import { Logger } from 'winston';

export {};

declare global {
  namespace Express {
    export interface Request  {
      logger: Logger
    }
  }
}
