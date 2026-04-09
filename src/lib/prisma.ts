import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString: string = process.env.DATABASE_URL as string;
const adapter  = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});


export {prisma}