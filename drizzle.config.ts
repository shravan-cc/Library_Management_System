import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import { AppEnvs } from './read-env';

export default defineConfig({
  schema: './database/src/drizzle/schema.ts',
  out: './database/src/drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: AppEnvs.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
