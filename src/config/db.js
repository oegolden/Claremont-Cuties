// Central DB pool exporter. Uses 'pg' if available and DATABASE_URL is set.
import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60
}) || null;

export function close() {
  if (pool) {
    pool.end();
  }
}