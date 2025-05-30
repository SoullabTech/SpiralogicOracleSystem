// Frontend logger utility
// Since we're in the browser, we'll use console methods with enhanced formatting

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerOptions {
  level?: LogLevel;
  timestamp?: boolean;
  prefix?: string;
}

class Logger {
  private level: LogLevel;
  private timestamp: boolean;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || (process.env.NODE_ENV === 'development' ? 'debug' : 'warn');
    this.timestamp = options.timestamp !== false;
    this.prefix = options.prefix || '[SoulLab]';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.timestamp ? new Date().toISOString() : '';
    const baseMessage = `${this.prefix} ${timestamp} [${level.toUpperCase()}] ${message}`;
    return baseMessage;
  }

  error(message: string, meta?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), meta || '');
      
      // Send critical errors to backend for tracking
      if (typeof window !== 'undefined' && window.fetch) {
        this.sendToBackend('error', message, meta);
      }
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), meta || '');
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), meta || '');
    }
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), meta || '');
    }
  }

  // Group related logs together
  group(label: string) {
    if (this.shouldLog('debug')) {
      console.group(`${this.prefix} ${label}`);
    }
  }

  groupEnd() {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  // Time performance measurements
  time(label: string) {
    if (this.shouldLog('debug')) {
      console.time(`${this.prefix} ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.shouldLog('debug')) {
      console.timeEnd(`${this.prefix} ${label}`);
    }
  }

  // Send critical logs to backend
  private async sendToBackend(level: LogLevel, message: string, meta?: any) {
    try {
      // Only send errors in production
      if (process.env.NODE_ENV === 'production' && level === 'error') {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level,
            message,
            meta,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });
      }
    } catch (error) {
      // Silently fail - we don't want logging errors to break the app
      console.error('Failed to send log to backend:', error);
    }
  }
}

// Create default logger instance
const logger = new Logger();

// Export default instance and Logger class
export default logger;
export { Logger };

// Export convenience methods
export const logError = (message: string, meta?: any) => logger.error(message, meta);
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);