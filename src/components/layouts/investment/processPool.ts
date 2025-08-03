import { WalletFunctionsDefinitions } from '@/types/wallet';
import { PoolInfo } from '@/types/backend/pools';
import {
    convertUSDToTokenAmount,
    getTokenPrices,
} from '@/libs/1inch/getTokenPrices';
import { UseSwapReturn } from '@/types/1inch/swap';
import { executeTokensSwaps } from '@/libs/1inch/executeSwaps';
import { addLiquidityAndMintPosition } from '@/libs/uniswap/addLiquidity';
import { ethers } from 'ethers';
import { UniswapTokenAllowanceFunctionsDefinitions } from '@/types/uniswap/allowance';
import { convertHumanReadableToWei } from '@/utils/converter';

interface Props {
    poolInfo: PoolInfo;
    amountToInvestToPool: number;
    walletAddress: string;
    onProgress: (step: string, progress: number) => void;
    onComplete: () => void;
    sendTransaction: WalletFunctionsDefinitions['sendTransaction'];
    swapTokens: UseSwapReturn['swapTokens'];
    provider: ethers.providers.Provider;
    checkTokenAllowance: UniswapTokenAllowanceFunctionsDefinitions['checkTokenAllowance'];
    approveToken: UniswapTokenAllowanceFunctionsDefinitions['approveToken'];
}

export const processPoolInvestment = async ({
    poolInfo,
    amountToInvestToPool,
    walletAddress,
    onProgress,
    sendTransaction,
    swapTokens,
    provider,
    checkTokenAllowance,
    approveToken,
    onComplete,
}: Props) => {
    // THEN CHECK POOL INFO AND SWAP USDC TO NECESSARY TOKENS

    onProgress(`Swapping tokens for risky pool...`, 30);

    // Get token prices from 1inch to convert USD to tokens prices and then to BigInt
    const tokenPrices = await getTokenPrices([
        poolInfo.token0,
        poolInfo.token1,
    ]);

    // Calculate tokens amounts that should be after a swap of USDC. All tokens are in USD
    // As one pool can be recommended then we split the amount in half for each token
    const token0AmountUSD = amountToInvestToPool / 2;
    const token1AmountUSD = amountToInvestToPool / 2;

    // This is amount of USDC that will be used to swap USDC to any token in BigInt format
    // As we have 1 pool and both token should be in equal proportion, this number is the same for swap of both tokens
    const usdcToSwapPerTokenBigInt = convertHumanReadableToWei(
        token0AmountUSD,
        6
    );

    // Convert USD amount per token to a token amount using current prices
    const token0AmountBigInt = convertUSDToTokenAmount(
        token0AmountUSD,
        poolInfo.token0,
        poolInfo.token0Decimals,
        tokenPrices[poolInfo.token0.toLowerCase()]
    );
    const token1AmountBigInt = convertUSDToTokenAmount(
        token1AmountUSD,
        poolInfo.token1,
        poolInfo.token1Decimals,
        tokenPrices[poolInfo.token1.toLowerCase()]
    );

    // console.log('Total amount to invest:', amountToInvest);
    console.log(
        `Total amount to invest into ${poolInfo.token0Symbol}/${poolInfo.token1Symbol} pool:`,
        amountToInvestToPool
    );
    console.log(
        `Tokens to invest pool ${poolInfo.token0Symbol}/${poolInfo.token1Symbol} in USD:`,
        {
            token0USD: token0AmountUSD,
            token1USD: token1AmountUSD,
        }
    );
    console.log(
        `Tokens to invest pool ${poolInfo.token0Symbol}/${poolInfo.token1Symbol} in BigInt:`,
        {
            token0BigInt: token0AmountBigInt,
            token1BigInt: token1AmountBigInt,
        }
    );

    // Swap USDC to tokens that are needed for the pool
    await executeTokensSwaps({
        usdcToSwapPerTokenBigInt,
        poolInfo,
        walletAddress,
        onProgress,
        swapTokens,
    });

    // Mint a Uniswap V3 position based on swapped tokens
    await addLiquidityAndMintPosition({
        poolInfo,
        token0AmountBigInt,
        token1AmountBigInt,
        walletAddress,
        onProgress,
        provider,
        sendTransaction,
        checkTokenAllowance,
        approveToken,
    });

    onProgress('Adding liquidity to pools...', 95);

    onProgress('Investment completed successfully!', 100);
    onComplete();
};
