import Redis from "ioredis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

// ============================================================
// KEY PREFIXES
// ============================================================
export const REDIS_KEYS = {
  // Auth
  passwordReset:   (token: string)         => `pwd_reset:${token}`,
  emailVerify:     (token: string)         => `email_verify:${token}`,
  // Rate limiting
  loginRate:       (ip: string)            => `rate:login:${ip}`,
  orderRate:       (userId: string)        => `rate:order:${userId}`,
  // Sessions
  session:         (userId: string)        => `session:${userId}`,
  // Order drafts
  orderDraft:      (userId: string)        => `order_draft:${userId}`,
  // Cache
  warehouseItems:  (userId: string)        => `warehouse:${userId}`,
  feeConfig:       ()                      => `fee_config:all`,
  tracking:        (trackingNumber: string) => `tracking:${trackingNumber}`,
} as const;

// ============================================================
// TTLs (seconds)
// ============================================================
export const REDIS_TTL = {
  passwordReset:  60 * 60,           // 1 hour
  emailVerify:    60 * 60 * 24,      // 24 hours
  loginRate:      60 * 10,           // 10 minutes (5 attempts per window)
  orderRate:      60,                // 1 minute
  session:        60 * 60 * 24 * 30, // 30 days
  orderDraft:     60 * 60 * 2,       // 2 hours
  warehouseItems: 60 * 3,            // 3 minutes
  feeConfig:      60 * 10,           // 10 minutes
  tracking:       60 * 10,           // 10 minutes
} as const;

// ============================================================
// CLIENT
// ============================================================
class RedisClient {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error("Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      logger.info("Redis connected");
    });

    this.client.on("disconnect", () => {
      this.isConnected = false;
      logger.warn("Redis disconnected");
    });

    this.client.on("error", (err: Error) => {
      logger.error("Redis error", { message: err.message });
    });
  }

  get raw(): Redis {
    return this.client;
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      logger.error("Redis GET error", { key, err });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      logger.error("Redis SET error", { key, err });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.error("Redis DEL error", { key, err });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (err) {
      logger.error("Redis EXPIRE error", { key, err });
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch {
      return -1;
    }
  }

  /** Sliding-window rate limiter. Returns { allowed, remaining, resetIn }. */
  async rateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    try {
      const current = await this.client.incr(key);
      if (current === 1) await this.client.expire(key, windowSeconds);
      const ttlVal = await this.client.ttl(key);
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetIn: ttlVal,
      };
    } catch {
      return { allowed: true, remaining: maxRequests, resetIn: windowSeconds };
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (err) {
      logger.error("Redis PUBLISH error", { channel, err });
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

const globalForRedis = globalThis as unknown as { redis: RedisClient | undefined };

export const redis = globalForRedis.redis ?? new RedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
