import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/codedna";

if (connectionString.startsWith("prisma+postgres://")) {
  try {
    const url = new URL(connectionString);
    const apiKey = url.searchParams.get("api_key");
    if (apiKey) {
      const decoded = Buffer.from(apiKey, "base64").toString("utf-8");
      const config = JSON.parse(decoded);
      if (config.databaseUrl) {
        console.log("[DB] Extracted native PostgreSQL connection string from Prisma 7 API Key.");
        connectionString = config.databaseUrl;
      }
    }
  } catch (err: any) {
    console.error("[DB] Failed to extract databaseUrl from prisma+postgres:", err.message);
  }
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
