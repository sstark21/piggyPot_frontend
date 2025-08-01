import { formatUnits } from "ethers";

export const convertWeiToHumanReadable = (
  weiAmount: string | number,
  decimals: number,
  returnBigInt: boolean = false
): string | bigint => {
  const result = formatUnits(weiAmount, decimals);
  return returnBigInt ? BigInt(result) : result;
};
