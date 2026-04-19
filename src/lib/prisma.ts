import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is not set.");
}

const parsedPoolMax = Number(process.env.PRISMA_POOL_MAX ?? "5");
const poolMax = Number.isFinite(parsedPoolMax) && parsedPoolMax > 0 ? parsedPoolMax : 5;

const createPrismaClient = () => {
	const adapter = new PrismaPg({
		connectionString,
		max: poolMax,
		idleTimeoutMillis: 10_000,
		connectionTimeoutMillis: 10_000,
		ssl:
			process.env.NODE_ENV === "production"
				? { rejectUnauthorized: false }
				: undefined,
	});

	return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}