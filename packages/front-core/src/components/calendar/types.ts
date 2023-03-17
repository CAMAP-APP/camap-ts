export enum CalendarNavigationAction {
  Previous = -1,
  Next = 1,
}

export type CalendarMarker = symbol;

export const CALENDAR_MARKERS: { [key: string]: CalendarMarker } = {
  FIRST_MONTH: Symbol('firstMonth'),
  SECOND_MONTH: Symbol('secondMonth'),
};
