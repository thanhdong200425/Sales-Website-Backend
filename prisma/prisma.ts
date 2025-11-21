import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore - generated client requires explicit .ts extension under ESM
import { PrismaClient } from '../generated/prisma/client.ts'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }