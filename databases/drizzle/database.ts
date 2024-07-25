import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import 'dotenv/config';
import { UserTable } from './schema';
import { AppEnvs } from '../../read-env';

// Create a function to initialize the database connection and perform migrations
async function initializeDb() {
  // Database URL
  //const databaseUrl = 'mysql://user:user_password@localhost:3306/library_db';
  //   Connection for migrations
  // Connection pool for queries
  console.log(AppEnvs);
  const pool = mysql.createPool({
    uri: AppEnvs.DATABASE_URL,
  });
  // Create and return the `db` instance
  return drizzle(pool);
}
// Export the `db` instance and `UserTable` after initialization
let db: ReturnType<typeof drizzle> | undefined;
export async function getDb() {
  if (!db) {
    db = await initializeDb();
  }
  return db;
}
export { UserTable };

getDb();
