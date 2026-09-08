type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  msg: string;
  level?: LogLevel;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private log(level: LogLevel, payload: LogPayload) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      ...payload,
    };

    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  info(payload: LogPayload) {
    this.log('info', payload);
  }

  warn(payload: LogPayload) {
    this.log('warn', payload);
  }

  error(payload: LogPayload) {
    this.log('error', payload);
  }

  debug(payload: LogPayload) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', payload);
    }
  }
}

export const logger = new StructuredLogger();

