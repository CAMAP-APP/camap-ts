export const ordersAreOpen = ({ orderStartDate, orderEndDate }: { orderStartDate: Date; orderEndDate?: Date }) => {
  const now = Date.now();
  if (orderEndDate == null || !(orderStartDate.getTime() < now && orderEndDate.getTime() > now)) {
    return false;
  }
  return true;
};
