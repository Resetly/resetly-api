import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as path from 'path';

const createPostgresClient = (
  typeof postgres === 'function' ? postgres : (postgres as any).default
) as typeof postgres;

async function runMigrations() {
  const databaseUrl =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/resetly';

  console.log('Connecting to database for migrations...');
  const migrationClient = createPostgresClient(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('Running migrations from src/database/migrations...');
  const migrationsFolder = path.join(__dirname, 'migrations');

  try {
    await migrate(db, { migrationsFolder });
    console.log('Migrations executed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
