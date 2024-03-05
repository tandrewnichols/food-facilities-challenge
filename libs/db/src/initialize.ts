import postgres from 'postgres';

const getConnection = (database: string) =>
  postgres({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
    port: Number(process.env.DB_PORT) || 5432,
  });

/* eslint-disable no-console */
(async () => {
  let sql = getConnection('postgres');

  try {
    await sql`
      CREATE DATABASE radai
    `;
  } catch {
    // Ignore if already present
  } finally {
    await sql.end();
    sql = getConnection('radai');
  }

  console.log('Creating pgcrypto extension');
  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto
  `;

  console.log('Creating cube extension');
  await sql`
    CREATE EXTENSION IF NOT EXISTS cube SCHEMA pg_catalog
  `;

  console.log('Creating earthdistance extension');
  await sql`
    CREATE EXTENSION IF NOT EXISTS earthdistance SCHEMA pg_catalog
  `;

  await sql.end();
})();
/* eslint-enable no-console */
