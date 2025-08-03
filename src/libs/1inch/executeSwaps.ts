import { PoolInfo } from '@/types/backend/pools';
import { UseSwapReturn } from '@/types/1inch/swap';

interface Props {
    usdcToSwapPerTokenBigInt: bigint;
    poolInfo: PoolInfo;
    walletAddress: string;
    onProgress: (step: string, progress: number) => void;
    swapTokens: UseSwapReturn['swapTokens'];
}

export const executeTokensSwaps = async ({
    usdcToSwapPerTokenBigInt,
    poolInfo,
    walletAddress,
    onProgress,
    swapTokens,
}: Props) => {
    // THEN CHECK POOL INFO AND SWAP USDC TO NECESSARY TOKENS

    // Swap USDC to tokens that are needed for the pool
    if (usdcToSwapPerTokenBigInt > 0) {
        onProgress(`Swapping USDC to ${poolInfo.token0Symbol}...`, 30);
        await swapTokens(
            poolInfo.token0,
            usdcToSwapPerTokenBigInt.toString(),
            walletAddress
        );

        onProgress(`Swapping USDC to ${poolInfo.token1Symbol}...`, 30);
        await swapTokens(
            poolInfo.token1,
            usdcToSwapPerTokenBigInt.toString(),
            walletAddress
        );
    }
};
