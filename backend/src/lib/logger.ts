// src/lib/logger.ts
import { createClient } from '@supabase/supabase-js';
import winston from 'winston';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use to print out messages
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
  }),
  // Allow to print all the error message inside the all.log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'all.log'),
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

// Export logger instance
export default logger;

// Export specific log methods for convenience
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

/**
 * Logs a message from any intelligent agent (e.g., GuideAgent, ShadowAgent).
 */
export async function logAgentInteraction({
  userId,
  agent,
  content,
  phase,
}: {
  userId: string;
  agent: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from('adjuster_logs').insert({
    user_id: userId,
    agent,
    message: content,
    spiral_phase: phase || null,
  });

  if (error) {
    console.error('❌ Logger (agent) error:', error);
  }
}

/**
 * Logs a journal entry with optional emotion tagging and symbolic extraction.
 */
export async function logJournalEntry({
  userId,
  content,
  emotionTag,
  symbols,
}: {
  userId: string;
  content: string;
  emotionTag?: string;
  symbols?: string[];
}) {
  const { error } = await supabase.from('memory_items').insert({
    user_id: userId,
    content,
    emotion_tag: emotionTag || null,
    symbols: symbols || [],
  });

  if (error) {
    console.error('❌ Journal logging error:', error);
  }
}

/**
 * Logs a system-generated insight or reflection from the Adjuster Agent.
 */
export async function logAdjusterInsight({
  userId,
  content,
  phase,
}: {
  userId: string;
  content: string;
  phase?: string;
}) {
  const { error } = await supabase.from('adjuster_logs').insert({
    user_id: userId,
    agent: 'AdjusterAgent',
    message: content,
    spiral_phase: phase || null,
  });

  if (error) {
    console.error('❌ Adjuster insight logging error:', error);
  }
}
