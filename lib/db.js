// Database connection pool. One shared pool for the whole app.
import { Pool } from 'pg';

const globalForPg = globalThis;

export const pool =
  globalForPg._craftoraPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg._craftoraPool = pool;
}

// Small helper: run a query and get rows back.
export async function query(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

// Get a single row (or null).
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] || null;
}
