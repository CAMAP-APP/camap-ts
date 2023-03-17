/* eslint-disable no-console */

const canLog = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

export const log = (...args: any[]) => {
  if (canLog) console.log(args);
};

export const logWarn = (...args: any[]) => {
  if (canLog) console.warn(args);
};

export const logError = (...args: any[]) => {
  if (canLog) console.error(args);
};
