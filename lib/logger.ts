import winston from "winston";
import path from "path";

const LOG_DIR = process.env.LOG_DIR ?? "logs";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const SERVICE_NAME = "baozhen";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Dev console format
const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${ts} [${level}] ${message}${metaStr}`;
});

// Production JSON format
const prodFormat = combine(
  errors({ stack: true }),
  timestamp({ format: "ISO" }),
  json()
);

const transports: winston.transport[] = [];

if (process.env.NODE_ENV === "production") {
  // File transports for production
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      format: prodFormat,
    })
  );
} else {
  // Console for development
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "HH:mm:ss" }),
        devFormat
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: SERVICE_NAME },
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(LOG_DIR, "exceptions.log") }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(LOG_DIR, "rejections.log") }),
  ],
});

// HTTP request logger middleware data
export function logRequest(data: {
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  ip?: string;
}) {
  const level = data.status >= 500 ? "error" : data.status >= 400 ? "warn" : "http";
  logger.log(level, "HTTP Request", data);
}

// Auth event logger
export function logAuthEvent(
  event: "login" | "logout" | "register" | "password_reset" | "email_verify" | "oauth",
  userId: string,
  metadata?: Record<string, unknown>
) {
  logger.info("Auth Event", { event, userId, ...metadata });
}

// Order event logger
export function logOrderEvent(
  event: string,
  orderId: string,
  userId: string,
  metadata?: Record<string, unknown>
) {
  logger.info("Order Event", { event, orderId, userId, ...metadata });
}

// Stripe event logger
export function logStripeEvent(event: string, data: Record<string, unknown>) {
  logger.info("Stripe Webhook", { event, ...data });
}
