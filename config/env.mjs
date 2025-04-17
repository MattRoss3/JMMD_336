import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

export const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  SESSION_SECRET,
  OPENAI_API_KEY,
  DICTIONARY_API_KEY
} = process.env;