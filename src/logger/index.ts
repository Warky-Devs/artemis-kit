// Types
type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
};

type LoggerPlugin = {
  name: string;
  onLog: (entry: LogEntry) => Promise<void>;
};

type Logger = {
  error: (message: string, data?: unknown) => Promise<void>;
  warn: (message: string, data?: unknown) => Promise<void>;
  info: (message: string, data?: unknown) => Promise<void>;
  debug: (message: string, data?: unknown) => Promise<void>;
  registerPlugin: (plugin: LoggerPlugin) => void;
};

// Create logger instance
const createLogger = (): Logger => {
  const plugins: LoggerPlugin[] = [];

  const getLogLevelEmoji = (level: LogLevel): string => {
    switch (level) {
      case 'ERROR':
        return '🔥'; // Fire for errors
      case 'WARN':
        return '⚠️'; // Warning sign for warnings
      case 'INFO':
        return '💡'; // Light bulb for info
      case 'DEBUG':
        return '🔍'; // Magnifying glass for debug
    }
  };

  const formatMessage = (entry: LogEntry): string => {
    const timestamp = entry.timestamp.toISOString();
    const emoji = getLogLevelEmoji(entry.level);
    let message = `${emoji} [${timestamp}] ${entry.level}: ${entry.message}`;
    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    return message;
  };

  const notifyPlugins = async (entry: LogEntry): Promise<void> => {
    const pluginPromises = plugins.map(plugin => 
      plugin.onLog(entry).catch(error => {
        console.error(`Plugin "${plugin.name}" failed:`, error);
      })
    );
    await Promise.all(pluginPromises);
  };

  const log = async (level: LogLevel, message: string, data?: unknown): Promise<void> => {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };

    const formattedMessage = formatMessage(entry);

    // Console output with color coding
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'INFO':
        console.info(formattedMessage);
        break;
      case 'DEBUG':
        console.debug(formattedMessage);
        break;
    }

    await notifyPlugins(entry);
  };

  return {
    error: (message: string, data?: unknown) => log('ERROR', message, data),
    warn: (message: string, data?: unknown) => log('WARN', message, data),
    info: (message: string, data?: unknown) => log('INFO', message, data),
    debug: (message: string, data?: unknown) => log('DEBUG', message, data),
    registerPlugin: (plugin: LoggerPlugin) => {
      plugins.push(plugin);
      console.log(`🔌 Plugin "${plugin.name}" registered`);
    }
  };
};

export {createLogger}
export type {LogEntry,LogLevel,LoggerPlugin,Logger}