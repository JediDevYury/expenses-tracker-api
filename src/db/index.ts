import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Thanks to https://github.com/zacharynoble/express-typescript-postgres-drizzle-auth-template
import { DB_DATABASE, DB_HOST, DB_MAX_CONNECTIONS, DB_PASSWORD, DB_PORT, DB_USER } from '@/config';
import * as attendance from '@/models/attendance';
import * as events from '@/models/events';
import * as users from '@/models/users';
import * as comments from '@/models/comments';

const pg = postgres({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  max: DB_MAX_CONNECTIONS,
});

const db = drizzle(pg, { schema: { ...attendance, ...users, ...events, ...comments } });

export default db;
