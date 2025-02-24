
export enum LogLevel {
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL"
}

/**
 * Takes a variable list of data and logs to the file and console based on
 * @param message (String) primary message to log
 * @param level (LogLevel) default: INFO. The level to log this message at
 * @param datas (...any[]) Optional objects to log including a single error
 */
export function log (message: string, level: LogLevel = LogLevel.INFO, ...datas: any[]) {
  const fullMessage: any = {
    message
  };
  let i = 0;
  if (datas && datas.length > 0) {
    for (const data of datas) {
      if (data) {
        if (data instanceof Error) {
          // Only allow one. Overwrite otherwise
          fullMessage.error = data.message || `${data}`;
          // console.error(data);
          if (!message) {
            // eslint-disable-next-line no-console
            console.error(data.stack || new Error("Error with no stack"));
            message = data.message;
          }
        } else if (data instanceof Map) {
          // Only allow one. Overwrite otherwise
          fullMessage.data = Object.assign(fullMessage.data || {}, { map: [...data] });
        } else if (typeof data === "string" || Array.isArray(data)) {
          // Object.assign doesn't work combining objects and arrays
          // instanceOf String didn't work and caused an object.assign
          if (datas.length > 1) {
            // If there's more than one, add a counter to differentiate
            // data0 will be different than data to avoid objects overwriting this
            fullMessage["data" + i++] = data;
          } else {
            fullMessage.data = data;
          }
        } else {
          // If we have a testId and/or name (pageName), put them in the main message and remove them.
          // We can't delete them from the real one passed in, so create a cloned copy
          const dataCopy = Object.assign({}, data);
          if (dataCopy.environment && typeof dataCopy.environment === "string") {
            fullMessage.environment = dataCopy.environment;
            delete dataCopy.environment;
          }
          if (dataCopy.testId && typeof dataCopy.testId === "string") {
            fullMessage.testId = dataCopy.testId;
            delete dataCopy.testId;
          }
          // eslint-disable-next-line no-prototype-builtins
          if (dataCopy.hasOwnProperty("simLocation")) { // Can be null
            fullMessage.simLocation = dataCopy.simLocation;
            delete dataCopy.simLocation;
          }
          if (dataCopy.name && typeof dataCopy.name === "string") {
            fullMessage.name = dataCopy.name;
            delete dataCopy.name;
          }
          if (dataCopy.pageName && typeof dataCopy.pageName === "string") {
            fullMessage.name = dataCopy.pageName;
            delete dataCopy.pageName;
          }
          // eslint-disable-next-line no-prototype-builtins
          if (dataCopy.hasOwnProperty("reload")) {
            fullMessage.reload = dataCopy.reload;
            delete dataCopy.reload;
          }
          // eslint-disable-next-line no-prototype-builtins
          if (dataCopy.hasOwnProperty("sessionId")) {
            fullMessage.sessionId = dataCopy.sessionId;
            delete dataCopy.sessionId;
          }
          // If all we had was a testId and/or name it'll be an empty object. Don't log it
          if (Object.keys(dataCopy).length > 0 && Object.values(dataCopy).some((value: any) => value !== undefined)) {
            // If there's already an object, do an Object.assign on top of it.
            // This will never be a string because of the length check above on typeof == string
            fullMessage.data = Object.assign(fullMessage.data || {} , dataCopy);
          }
        }
      }
    }
  }
  switch (level) {
    case LogLevel.TRACE:
      console.trace(fullMessage);
      break;
    case LogLevel.DEBUG:
      console.debug(fullMessage);
      break;
    case LogLevel.INFO:
      console.info(fullMessage);
      break;
    case LogLevel.WARN:
      console.warn(fullMessage);
      break;
    case LogLevel.ERROR:
      console.error(fullMessage);
      if ((!fullMessage.message || fullMessage.message === "undefined") && !fullMessage.error) {
        // eslint-disable-next-line no-console
        console.error(new Error("Log Error with NO message or error"));
      }
      break;
    case LogLevel.FATAL:
      console.error(fullMessage);
      // eslint-disable-next-line no-console
      console.error(new Error("Log Fatal Stack Trace"));
      break;
    default:
      console.log(fullMessage);
      break;
  }
}
