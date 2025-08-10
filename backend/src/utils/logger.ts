import * as winston from "winston";
import * as fs from "fs";
import * as path from "path";
// import { config } from '@/config'; // Temporarily disabled

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Register color scheme with winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
  }),
  new winston.transports.File({ filename: path.join(logsDir, "all.log") }),
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

// Export specific logging functions for backwards compatibility
export const logAdjusterInsight = (data: any) =>
  logger.info("Adjuster Insight", data);
export const logJournalEntry = (data: any) =>
  logger.info("Journal Entry", data);

// Export default logger
export default logger;
