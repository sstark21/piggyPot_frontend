export const convertWeiToHumanReadable = (
  weiAmount: string,
  decimals: number
): number => {
  const weiBigInt = BigInt(weiAmount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = weiBigInt / divisor;
  const remainder = weiBigInt % divisor;

  const remainderStr = remainder.toString().padStart(decimals, "0");
  const decimalPart = parseFloat(`0.${remainderStr}`);

  return Number(wholePart) + decimalPart;
};
