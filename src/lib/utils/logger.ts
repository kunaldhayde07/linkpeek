// ============================================================================
// Structured Logger
// JSON-formatted logs for production observability
// ============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function createLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === "development") {
    const { level, message, timestamp: _, ...meta } = entry;
    const prefix = {
      debug: "🔍",
      info: "ℹ️ ",
      warn: "⚠️ ",
      error: "❌",
    }[level];
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${prefix} [${level.toUpperCase()}] ${message}${metaStr}`;
  }
  return JSON.stringify(entry);
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(formatLog(createLogEntry("debug", message, meta)));
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.log(formatLog(createLogEntry("info", message, meta)));
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(formatLog(createLogEntry("warn", message, meta)));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(formatLog(createLogEntry("error", message, meta)));
  },
};
