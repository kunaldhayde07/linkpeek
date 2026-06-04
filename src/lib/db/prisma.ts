import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * In development, Next.js hot-reloads modules on every change.
 * Without this pattern, each reload would create a new PrismaClient instance,
 * eventually exhausting database connections.
 *
 * In production, this creates exactly one PrismaClient instance per
 * serverless function cold start.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
