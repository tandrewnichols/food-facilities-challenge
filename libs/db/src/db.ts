import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';

export const client = postgres({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'radai',
  port: Number(process.env.DB_PORT) || 5432,
});

export const db = drizzle(client, { schema, logger: true });
