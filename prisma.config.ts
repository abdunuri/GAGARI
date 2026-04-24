import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Mirror Next.js local env priority for Prisma CLI commands.
loadEnv({ path: ".env", quiet: true });
if (process.env["NODE_ENV"] !== "production") {
  loadEnv({ path: ".env.local", override: true, quiet: true });
}

const databaseUrl = process.env["DIRECT_URL"] ?? process.env["SUPABASE_DATABASE_URL"] ?? process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
