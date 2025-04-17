import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASS, DB_NAME } from './env.mjs';

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});