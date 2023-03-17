import React, { ReactElement } from 'react';

export interface AttendanceFormat {
  cellHeight: 'big' | 'small';
  onePersonPerPage: boolean;
}

export interface AttendanceColumn {
  value: string;
  width?: number;
  align?: 'center' | 'right';
  colSpan?: number;
  rowSpan?: number;
  alwaysSmallHeight?: boolean;
}

type AttendanceBodyCellOptions = Pick<
  AttendanceColumn,
  'align' | 'colSpan' | 'alwaysSmallHeight' | 'rowSpan' | 'width'
>;

export type AttendanceBodyCellContent =
  | {
      type?: 'string' | undefined;
      value: string | string[] | ReactElement;
    }
  | {
      type: 'number' | 'currency';
      value: number | number[] | ReactElement;
    }
  | {
      type: 'clear';
    };

export type AttendanceBodyCell = AttendanceBodyCellOptions &
  AttendanceBodyCellContent;

export interface AttendanceTableData {
  tableTitles?: React.ReactNode[];
  head: AttendanceColumn[];
  body: AttendanceBodyCell[][][];
}
