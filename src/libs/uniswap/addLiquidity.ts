import {
    MAX_APPROVAL_AMOUNT,
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
} from '@/config/constants';
import { PoolInfo } from '@/types/backend/pools';
import { ethers } from 'ethers';
import { constructPosition, mintPosition } from './position';
import { UniswapTokenAllowanceFunctionsDefinitions } from '@/types/uniswap/allowance';
import { WalletFunctionsDefinitions } from '@/types/wallet';

interface Props {
    poolInfo: PoolInfo;
    token0AmountBigInt: bigint;
    token1AmountBigInt: bigint;
    walletAddress: string;
    onProgress: (step: string, progress: number) => void;
    provider: ethers.providers.Provider;
    sendTransaction: WalletFunctionsDefinitions['sendTransaction'];
    checkTokenAllowance: UniswapTokenAllowanceFunctionsDefinitions['checkTokenAllowance'];
    approveToken: UniswapTokenAllowanceFunctionsDefinitions['approveToken'];
}

export const addLiquidityAndMintPosition = async ({
    poolInfo,
    token0AmountBigInt,
    token1AmountBigInt,
    walletAddress,
    onProgress,
    provider,
    sendTransaction,
    checkTokenAllowance,
    approveToken,
}: Props) => {
    onProgress('Approving tokens for adding them to liquidity pool...', 45);

    const token0AllowanceForUniswap = await checkTokenAllowance(
        poolInfo.token0,
        NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
        walletAddress,
        token0AmountBigInt,
        provider!
    );

    console.log(`Checking allowance for Uniswap ${poolInfo.token0Symbol}:`, {
        current: token0AllowanceForUniswap,
        toBe: token0AmountBigInt,
    });

    if (token0AllowanceForUniswap < token0AmountBigInt) {
        onProgress(`Approving ${poolInfo.token0Symbol}...`, 50);
        await approveToken(
            poolInfo.token0,
            NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            walletAddress,
            MAX_APPROVAL_AMOUNT,
            provider!,
            sendTransaction
        );
    }

    const token1AllowanceForUniswap = await checkTokenAllowance(
        poolInfo.token1,
        NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
        walletAddress,
        token1AmountBigInt,
        provider!
    );

    console.log(`Checking allowance for Uniswap ${poolInfo.token1Symbol}:`, {
        current: token1AllowanceForUniswap,
        toBe: token1AmountBigInt,
    });

    if (token1AllowanceForUniswap < token1AmountBigInt) {
        onProgress(`Approving ${poolInfo.token1Symbol}...`, 55);
        await approveToken(
            poolInfo.token1,
            NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            walletAddress,
            MAX_APPROVAL_AMOUNT,
            provider!,
            sendTransaction
        );
    }

    onProgress(`Minting position for risky pool ${1}...`, 60);

    const fee = Number(poolInfo.feeTier);

    console.log('Fee for a pool:', fee);

    const position = await constructPosition({
        poolInfoRawData: poolInfo,
        token0AmountInBigInt: token0AmountBigInt,
        token1AmountInBigInt: token1AmountBigInt,
        provider: provider!,
    });

    console.log('Position for Uniswap:', position);

    // Mint position
    const txHash = await mintPosition(walletAddress, position, sendTransaction);

    console.log(`Position minted for risky pool ${1}:`, txHash);
};
