import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// configure dotenv
dotenv.config({path : '.env.local'});

// if env not exist
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export default defineConfig({
  out: './drizzle', // out directory
  schema: './lib/db/schema.ts', // configure the path
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations : {
    table : "__drizzle_migrations",
    schema : "public"
  },
  verbose : true,
  strict : true
});
