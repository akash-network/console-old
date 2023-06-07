export type LoggingSeverity = 'error' | 'warn' | 'info' | 'debug' | 'success';
export type LoggingCallback = (msg: string, sev: LoggingSeverity) => void;

const listeners = new Set<LoggingCallback>();

const loggingMethod = (severity: LoggingSeverity) => {
  return (msg: string) => listeners.forEach((cb) => cb(msg, severity));
};

const logging = {
  subscribe: (cb: LoggingCallback) => {
    listeners.add(cb);
  },
  unsubscribe: (cb: LoggingCallback) => {
    listeners.delete(cb);
  },

  // utility methods
  debug: loggingMethod('debug'),
  log: loggingMethod('info'),
  success: loggingMethod('success'),
  error: loggingMethod('error'),
  warn: loggingMethod('warn'),
};

logging.subscribe((msg: string) => console.log(msg));

(window as any).logging = logging;

export default logging;
