import postgres from 'postgres';

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
});

(async () => {
  try {
    await sql`
      CREATE DATABASE radai
    `;
  } catch {
    // Ignore if already present
  }

  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto
  `;

  await sql.end();
})();
