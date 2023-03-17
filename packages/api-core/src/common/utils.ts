import { getNamespace } from 'cls-hooked';
import { DeleteResult } from 'typeorm';
import { NAMESPACE_NAME } from 'typeorm-transactional-cls-hooked';
import { getEntityManagerForConnection } from 'typeorm-transactional-cls-hooked/dist/common';

export const checkDeleted = (
  result: DeleteResult,
  expected = 1,
  throwError = false,
): boolean => {
  if (throwError && result.affected !== expected) {
    throw Error('Record has not been deleted');
  }
  return result.affected === expected;
};

export const getCurrentTransaction = (connectionName = 'default') => {
  const currentTransaction = getEntityManagerForConnection(
    connectionName,
    getNamespace(NAMESPACE_NAME),
  );
  return currentTransaction.queryRunner;
};

/**
 * Deduplicate items by their id
 */
export const deduplicateById = <T extends { id: number }>(
  items: Array<T>,
): Array<T> => {
  const map = new Map<number, T>();
  items.forEach((i) => map.set(i.id, i));
  return [...map.values()];
};

export const mediumtextToJSONArray = (raw: string) => {
  if (raw.startsWith('[')) return JSON.parse(raw);
  const splited = raw
    .split(/,(?=(?:(?:(?!\}).)*\{)|[^\{\}]*$)/g)
    .filter((f) => Boolean(f))
    .map((f) =>
      f.startsWith('{') || f.startsWith('"') || f.startsWith("'") ? f : `"${f}"`,
    );
  return JSON.parse(`[${splited.join(',')}]`);
};

export const convertAllEmptyStringsToNull = <T>(entity: T): T => {
  const adaptedInput = entity;
  Object.keys(adaptedInput).forEach((key) => {
    if (
      adaptedInput[key] === '' ||
      (typeof adaptedInput[key] === 'string' && adaptedInput[key].trim() === '')
    )
      adaptedInput[key] = null;
  });
  return adaptedInput;
};
