import { ethers } from 'ethers';

export const convertWeiToHumanReadable = (
    weiAmount: string | number,
    decimals: number
): string => {
    const result = ethers.utils.formatUnits(weiAmount, decimals);
    return result;
};

export const convertHumanReadableToWei = (
    amount: number,
    decimals: number
): bigint => {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
};
