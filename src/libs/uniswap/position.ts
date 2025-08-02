import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import {
    MintOptions,
    NonfungiblePositionManager,
    Position,
} from '@uniswap/v3-sdk';
import { Pool } from '@uniswap/v3-sdk';
import { nearestUsableTick } from '@uniswap/v3-sdk';
import { createUniswapToken } from './createToken';
import { getPoolInfo } from './pool';
import { NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS } from '@/config/constants';
import { ethers } from 'ethers';
import { PoolInfo } from '@/types/backend/pools';

interface ConstructPositionProps {
    poolInfoRawData: PoolInfo;
    token0AmountInBigInt: bigint;
    token1AmountInBigInt: bigint;
    provider: ethers.providers.Provider;
}

export async function constructPosition({
    poolInfoRawData,
    token0AmountInBigInt,
    token1AmountInBigInt,
    provider,
}: ConstructPositionProps): Promise<Position> {
    console.log('Amounts to add in position in BigInt:', {
        token0AmountInBigInt,
        token1AmountInBigInt,
    });
    // Create Uniswap token objects
    const token0Currency = await createUniswapToken(
        poolInfoRawData.token0,
        poolInfoRawData.token0Decimals,
        poolInfoRawData.token0Symbol,
        poolInfoRawData.token0Name
    );
    const token1Currency = await createUniswapToken(
        poolInfoRawData.token1,
        poolInfoRawData.token1Decimals,
        poolInfoRawData.token1Symbol,
        poolInfoRawData.token1Name
    );

    // get pool info
    const poolInfo = await getPoolInfo(
        token0Currency,
        token1Currency,
        Number(poolInfoRawData.feeTier),
        provider
    );

    console.log('Pool info for Uniswap:', poolInfo);

    const token0AmountCurrency = CurrencyAmount.fromRawAmount(
        token0Currency,
        token0AmountInBigInt.toString()
    );
    const token1AmountCurrency = CurrencyAmount.fromRawAmount(
        token1Currency,
        token1AmountInBigInt.toString()
    );

    // construct pool instance
    const configuredPool = new Pool(
        token0AmountCurrency.currency,
        token1AmountCurrency.currency,
        poolInfo.fee,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        poolInfo.tick
    );

    console.log('Configured pool:', configuredPool);

    // create position using the maximum liquidity from input amounts
    return Position.fromAmounts({
        pool: configuredPool,
        tickLower:
            nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) -
            poolInfo.tickSpacing * 2,
        tickUpper:
            nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) +
            poolInfo.tickSpacing * 2,
        amount0: token0AmountCurrency.quotient,
        amount1: token1AmountCurrency.quotient,
        useFullPrecision: true,
    });
}

export async function mintPosition(
    address: string,
    positionToMint: Position,
    sendTransaction: (tx: {
        to: string;
        data: string;
        value: bigint;
    }) => Promise<string>
): Promise<string> {
    const mintOptions: MintOptions = {
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        slippageTolerance: new Percent(50, 10_000),
    };

    // get calldata for minting a position
    const { calldata, value } = NonfungiblePositionManager.addCallParameters(
        positionToMint,
        mintOptions
    );

    console.log('Uniswap position tx calldata and value:', { calldata, value });

    // build transaction
    const transaction = {
        data: calldata,
        to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
        value: BigInt(value),
    };

    console.log('Uniswap position tx:', transaction);

    return sendTransaction(transaction);
}
