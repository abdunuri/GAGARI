import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const connectionString: string = process.env.DATABASE_URL as string;
const adapter = new PrismaPg({
	connectionString,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: undefined,
});
const prisma = new PrismaClient({ adapter });

export { prisma };