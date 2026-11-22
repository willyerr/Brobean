import { createWriteStream, mkdirSync, type WriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

type LogContext = Record<string, unknown>;

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const defaultLogDirectory = resolve(currentDirectory, '../../logs');
const logDirectory = process.env.LOG_DIR
  ? resolve(process.env.LOG_DIR)
  : defaultLogDirectory;

mkdirSync(logDirectory, { recursive: true });

let activeDate = '';
let fileStream: WriteStream | undefined;

function getDateStamp(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getFileStream(date: string): WriteStream {
  if (!fileStream || activeDate !== date) {
    if (fileStream) fileStream.end();
    activeDate = date;
    fileStream = createWriteStream(
      resolve(logDirectory, `brobean-api-${date}.log`),
      { flags: 'a', encoding: 'utf8' }
    );
    fileStream.on('error', (error) => {
      console.error('[LOGGER FILE ERROR]', error.message);
    });
  }

  return fileStream;
}

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    };
  }

  return { error: String(error) };
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...context };
  const line = JSON.stringify(entry);

  if (level === 'ERROR' || level === 'FATAL') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }

  getFileStream(getDateStamp()).write(`${line}\n`);
}

const logger = {
  info(message: string, context?: LogContext) {
    write('INFO', message, context);
  },
  warn(message: string, context?: LogContext) {
    write('WARN', message, context);
  },
  error(message: string, error?: unknown, context: LogContext = {}) {
    write('ERROR', message, {
      ...context,
      ...(error === undefined ? {} : serializeError(error))
    });
  },
  fatal(message: string, error?: unknown, context: LogContext = {}) {
    write('FATAL', message, {
      ...context,
      ...(error === undefined ? {} : serializeError(error))
    });
  },
  close(): Promise<void> {
    return new Promise((resolveClose) => {
      if (!fileStream) {
        resolveClose();
        return;
      }
      fileStream.end(resolveClose);
    });
  }
};

export default logger;
