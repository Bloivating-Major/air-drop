import { drizzle } from 'drizzle-orm/neon-http';
import {migrate} from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless'

import * as  dotenv from 'dotenv'

// configure dotenv
dotenv.config({path : '.env.local'});

// if env not exist
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

async function runMigration(){
    console.log("🔄 Starting database migration...");
    try {
        // create a Neon SQL connection
        const sql = neon(process.env.DATABASE_URL!);

        // initialize drizzle with the connection
        const db = drizzle(sql);

        // run the migration
        console.log("📂 Running migrations from ./drizzle folder");
        await migrate(db, { migrationsFolder: './drizzle' });
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};


runMigration();