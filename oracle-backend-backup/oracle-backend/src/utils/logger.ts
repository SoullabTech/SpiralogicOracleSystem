// src/utils/logger.ts
import winston, { format, transports } from 'winston'
import 'winston-daily-rotate-file'
import { env } from '../lib/config'    // <-- import env, not config

const { combine, timestamp, colorize, printf, json, errors } = format

// A pretty‑print format for console
const consoleFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  const base = `${timestamp} [${level}]: ${message}`
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return stack ? `${base}\n${stack}` : base + metaStr
})

// Create the logger instance
const loggerInstance = winston.createLogger({
  level: env.LOG_LEVEL,            // use your env var here
  format: combine(
    errors({ stack: true }),       // capture and log stack traces
    timestamp()
  ),
  transports: [
    // Console transport for local/dev
    new transports.Console({
      level: env.LOG_CONSOLE_LEVEL || env.LOG_LEVEL,
      format: combine(
        colorize(),
        timestamp(),
        consoleFormat
      )
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
})

// In production, add rotating file transport
if (env.NODE_ENV === 'production') {
  loggerInstance.add(new transports.DailyRotateFile({
    filename: 'logs/%DATE%-combined.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: combine(
      timestamp(),
      json()
    )
  }))
}

// Named export for backward compatibility
export const logger = loggerInstance
export default loggerInstance
