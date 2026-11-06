import { getMembershipPeriod } from './membership-period';

describe('getMembershipPeriod', () => {
  const group = { membershipRenewalDate: '2000-09-01' };

  it.each([
    ['2026-08-31T21:59:59Z', 2025, '2025-09-01 00:00:00', '2026-09-01 00:00:00'],
    ['2026-08-31T22:00:00Z', 2026, '2026-09-01 00:00:00', '2027-09-01 00:00:00'],
    ['2026-10-31T12:00:00Z', 2026, '2026-09-01 00:00:00', '2027-09-01 00:00:00'],
  ])('uses the Paris renewal boundary at %s', (now, year, from, to) => {
    expect(getMembershipPeriod(group, new Date(now))).toEqual({ year, from, to });
  });

  it('defaults to the calendar year when no renewal date is configured', () => {
    expect(
      getMembershipPeriod(
        { membershipRenewalDate: null },
        new Date('2026-12-31T23:00:00Z'),
      ),
    ).toEqual({
      year: 2027,
      from: '2027-01-01 00:00:00',
      to: '2028-01-01 00:00:00',
    });
  });

  it('applies the anniversary rule when renewal is on leap day', () => {
    expect(
      getMembershipPeriod(
        { membershipRenewalDate: '2024-02-29' },
        new Date('2025-03-01T00:00:00Z'),
      ),
    ).toEqual({
      year: 2025,
      from: '2025-03-01 00:00:00',
      to: '2026-03-01 00:00:00',
    });
  });
});
