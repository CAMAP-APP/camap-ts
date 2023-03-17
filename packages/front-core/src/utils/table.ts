export type Order = 'asc' | 'desc';

type ComparatorType<T> = (a: T, b: T, orderBy: keyof T) => 0 | 1 | -1;

export function defaultComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function stableSort<T>(array: T[], order: Order, orderBy: keyof T, customComparator?: ComparatorType<T>) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  const comparator =
    order === 'desc'
      ? (a: T, b: T) => (customComparator ? customComparator(a, b, orderBy) : defaultComparator(a, b, orderBy))
      : (a: T, b: T) => (customComparator ? -customComparator(a, b, orderBy) : -defaultComparator(a, b, orderBy));
  stabilizedThis.sort((a, b) => {
    const o = comparator(a[0], b[0]);
    if (o !== 0) return o;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
