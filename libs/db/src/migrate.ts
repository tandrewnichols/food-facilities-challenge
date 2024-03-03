import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';
import path from 'path';

const client = postgres({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'radai',
  port: Number(process.env.DB_PORT) || 5432,
  max: 1
});

const db = drizzle(client, { schema });

import { migrate } from 'drizzle-orm/postgres-js/migrator';

(async () => {
  await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });
  await client.end();
})();
