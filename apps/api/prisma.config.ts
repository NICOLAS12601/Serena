import { defineConfig } from 'prisma/config';

// Load .env for local development. In production the variables are set by the
// hosting provider and there is no .env file, so a missing file is fine.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
