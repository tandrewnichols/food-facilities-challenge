import app from './app';
import logger from '@logger/logger';

const port = process.env.PORT || 3333;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);

process.on('uncaughtException', (error: Error) => {
  logger.error(error.message, { context: 'uncaughtException' });
});

process.on('unhandledRejection', (error: Error) => {
  logger.error(error.message, { context: 'unhandledRejection' });
});
