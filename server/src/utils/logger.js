const winston = require("winston");
const path = require("path");

// Generate today's date string
const today = new Date().toISOString().split("T")[0];

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

/**
 * Winston logger instance
 *
 * @type {import("winston").Logger}
 */
const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // Console output (dev-friendly)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),

    // Error log (per day)
    new winston.transports.File({
      filename: path.join("logs", `${today}-error.log`),
      level: "error",
    }),

    // Combined log (per day)
    new winston.transports.File({
      filename: path.join("logs", `${today}-combined.log`),
    }),
  ],
});

module.exports = logger;
