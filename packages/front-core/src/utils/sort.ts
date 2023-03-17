import { deburr } from 'lodash';

export const sortAlhabetically = (a: string, b: string) =>
  deburr(a) > deburr(b) ? 1 : -1;
