import { addMinutes, differenceInMinutes, subDays, addDays } from 'date-fns';
import { ordersAreOpen } from './distribution';

describe('distribution', () => {
  it('ordersAreOpen: false with orderEndDate=null', () => {
    const date = new Date();
    const res = ordersAreOpen({ orderStartDate: subDays(date, 2), orderEndDate: null });
    expect(res).toBeFalsy();
  });

  it('ordersAreOpen: false', () => {
    const date = new Date();
    const res = ordersAreOpen({ orderStartDate: subDays(date, 4), orderEndDate: subDays(date, 2) });
    expect(res).toBeFalsy();
  });

  it('ordersAreOpen: false', () => {
    const date = new Date();
    const res = ordersAreOpen({ orderStartDate: addDays(date, 2), orderEndDate: addDays(date, 4) });
    expect(res).toBeFalsy();
  });

  it('ordersAreOpen: false', () => {
    const date = new Date();
    const res = ordersAreOpen({ orderStartDate: addDays(date, 2), orderEndDate: subDays(date, 4) });
    expect(res).toBeFalsy();
  });

  it('ordersAreOpen: true', () => {
    const date = new Date();
    const res = ordersAreOpen({ orderStartDate: subDays(date, 2), orderEndDate: addDays(date, 2) });
    expect(res).toBeTruthy();
  });
});
