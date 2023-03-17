/* eslint-disable no-bitwise */
/**
 * function to read SFlags fields
 */
export const hasFlag = (enumIndex: number, flagValue: number): boolean => {
  if (enumIndex >= 32) throw new Error("Can't store more than 32 flags");
  // return flagValue.toString(2).substr(enumIndex, 1) === '1';
  // eslint-disable-next-line no-bitwise
  return (flagValue & (1 << enumIndex)) !== 0;
};

/**
 * function to set a value on a SFlags field
 * @param enumIndex enum index
 * @param flagValue flag field value
 * @param flag      enum flag : true or false
 */
export const setFlag = (enumIndex: number, flagValue: number): number => {
  // eslint-disable-next-line no-return-assign
  return (flagValue |= 1 << enumIndex);
};

export const unsetFlag = (enumIndex: number, flagValue: number): number => {
  // eslint-disable-next-line no-return-assign
  return (flagValue &= 0xffffffff - (1 << enumIndex));
};
