import { PoolInfo } from '@/types/backend/pools';
import { UseSwapReturn } from '@/types/1inch/swap';

interface Props {
    token0AmountBigInt: bigint;
    token1AmountBigInt: bigint;
    poolInfo: PoolInfo;
    walletAddress: string;
    onProgress: (step: string, progress: number) => void;
    swapTokens: UseSwapReturn['swapTokens'];
}

export const executeTokensSwaps = async ({
    token0AmountBigInt,
    token1AmountBigInt,
    poolInfo,
    walletAddress,
    onProgress,
    swapTokens,
}: Props) => {
    // THEN CHECK POOL INFO AND SWAP USDC TO NECESSARY TOKENS

    // Swap USDC to tokens that are needed for the pool
    if (token0AmountBigInt > 0) {
        onProgress(`Swapping USDC to ${poolInfo.token0Symbol}...`, 30);
        // await swapTokens(
        //     poolInfo.token0,
        //     token0AmountBigInt.toString(),
        //     walletAddress
        // );
    }

    if (token1AmountBigInt > 0) {
        onProgress(`Swapping USDC to ${poolInfo.token1Symbol}...`, 30);
        // await swapTokens(
        //     poolInfo.token1,
        //     token1AmountBigInt.toString(),
        //     walletAddress
        // );
    }
};
