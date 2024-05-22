import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

const dbUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

export default {
  dialect: 'postgresql',
  schema: './src/models',
  out: './drizzle',
  dbCredentials: {
    url: dbUrl,
  },
} satisfies Config;
