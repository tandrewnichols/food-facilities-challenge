import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'error',
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.Console({
      format: process.env.IS_LOCAL ? format.prettyPrint({ colorize: true }) : format.json()
    })
  ],
  defaultMeta: {
    environment: process.env.NODE_ENV,
  }
});

export default logger;
