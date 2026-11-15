import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { DB_DATE_FORMAT, TZ_PARIS } from '../common/constants';
import { GroupEntity } from './entities/group.entity';

/** Current membership year, expressed in the local time used by database dates. */
export const getMembershipPeriod = (
  group: Pick<GroupEntity, 'membershipRenewalDate'>,
  now = new Date(),
): { year: number; from: string; to: string } => {
  const today = utcToZonedTime(now, TZ_PARIS);
  const renewalDate = group.membershipRenewalDate
    ? parseISO(group.membershipRenewalDate)
    : new Date(today.getFullYear(), 0, 1);
  const month = renewalDate.getMonth();
  const day = renewalDate.getDate();
  let year = today.getFullYear();

  if (today < new Date(year, month, day)) year -= 1;

  return {
    year,
    from: format(new Date(year, month, day), DB_DATE_FORMAT),
    to: format(new Date(year + 1, month, day), DB_DATE_FORMAT),
  };
};
