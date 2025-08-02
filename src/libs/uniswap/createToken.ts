import { Token } from '@uniswap/sdk-core';
import { appConfig } from '@/config';

export const createUniswapToken = async (
    tokenAddress: string,
    tokenDecimals: number,
    tokenSymbol: string,
    tokenName: string
) => {
    const uniswapToken = new Token(
        appConfig.chain.id,
        tokenAddress,
        tokenDecimals,
        tokenSymbol,
        tokenName
    );

    return uniswapToken;
};
