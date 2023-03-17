import DataLoader = require('dataloader');

export interface NestDataLoader<ID, Type> {
  generateDataLoader(): DataLoader<ID, Type>;
}

export const NEST_LOADER_CONTEXT_KEY: string = 'NEST_LOADER_CONTEXT_KEY';
