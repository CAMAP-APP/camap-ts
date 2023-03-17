import { AttendanceFormat } from '../../components/attendanceSheet/attendanceSheet.interface';

export type CsaAttendanceFormat = AttendanceFormat & {
  classicContractContact: 0 | 1;
  classicContractProduct: 0 | 1;
  classicContractDate: 0 | 1;

  variableContractContact: 0 | 1;
};
