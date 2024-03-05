import app from './app';
import logger from '@logger/logger';

const port = process.env.API_PORT || 4000;

const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${ port }/api`);
});

server.on('error', (error: Error) => {
  logger.error(error.message, { context: 'serverError' });
});

process.on('uncaughtException', (error: Error) => {
  logger.error(error.message, { context: 'uncaughtException' });
});

process.on('unhandledRejection', (error: Error) => {
  logger.error(error.message, { context: 'unhandledRejection' });
});
