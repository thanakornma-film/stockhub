import { PrismaClient } from "@prisma/client";

// กัน Prisma สร้าง connection ซ้ำตอน hot-reload ใน dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
