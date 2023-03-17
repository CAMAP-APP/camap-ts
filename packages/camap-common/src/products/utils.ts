export const productCanHaveFloatQt = ({
  wholesale,
  variablePrice,
  bulk,
}: {
  wholesale: boolean;
  variablePrice: boolean;
  bulk: boolean;
}): boolean => {
  return wholesale || variablePrice || bulk;
};
