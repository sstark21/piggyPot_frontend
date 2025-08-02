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
import {
    MAX_FEE_PER_GAS,
    MAX_PRIORITY_FEE_PER_GAS,
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
} from '@/config/constants';
import { ethers } from 'ethers';
import { convertHumanReadableToWei } from '@/utils/converter';

export async function constructPosition(
    token0Address: string,
    token1Address: string,
    token0Decimals: number,
    token1Decimals: number,
    token0Symbol: string,
    token1Symbol: string,
    token0Name: string,
    token1Name: string,
    fee: number,
    token0Amount: bigint,
    token1Amount: bigint,
    provider: ethers.Provider
): Promise<Position> {
    console.log('Amounts:', { token0Amount, token1Amount });
    // Create Uniswap token objects
    const token0Currency = await createUniswapToken(
        token0Address,
        token0Decimals,
        token0Symbol,
        token0Name
    );
    const token1Currency = await createUniswapToken(
        token1Address,
        token1Decimals,
        token1Symbol,
        token1Name
    );

    // CurrencyAmount<Token>

    // get pool info
    const poolInfo = await getPoolInfo(
        token0Currency,
        token1Currency,
        fee,
        provider
    );

    console.log('Pool info for Uniswap:', poolInfo);

    const token0AmountCurrency = CurrencyAmount.fromRawAmount(
        token0Currency,
        convertHumanReadableToWei(
            Number(token0Amount),
            Number(token0Decimals)
        ).toString()
    );
    const token1AmountCurrency = CurrencyAmount.fromRawAmount(
        token1Currency,
        convertHumanReadableToWei(
            Number(token1Amount),
            Number(token1Decimals)
        ).toString()
    );

    console.log('Token amounts currency:', {
        token0AmountCurrency,
        token1AmountCurrency,
    });

    console.log('Pool info params for Uniswap:', {
        token0Currency,
        token1Currency,
        token0AmountCurrency,
        token1AmountCurrency,
        fee,
        poolInfo,
    });

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
        from: address,
        to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
        value: BigInt(value),
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    };

    console.log('Uniswap position tx:', transaction);

    return sendTransaction(transaction);
}
