import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "event", level: "error" },
            { emit: "event", level: "warn" },
          ]
        : [{ emit: "event", level: "error" }],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$on("query", (e: { query: string; duration: number; params: string }) => {
    if (e.duration > 1000) {
      logger.warn("Slow query detected", {
        query: e.query,
        duration: e.duration,
        params: e.params,
      });
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on("error", (e: { message: string; target: string }) => {
  logger.error("Prisma error", { message: e.message, target: e.target });
});
