import { RecommendationResponse } from '@/types/backend/pools';

export const poolsRecommendationsMock: RecommendationResponse = {
    success: true,
    data: {
        operationId: '876104cd-7ec8-45ec-958f-6ab0111423ff',
        recommendations: [
            {
                poolId: '0xd0b53d9277642d899df5c87a3966a349a798f224',
                feeTier: '500',
                token0Symbol: 'WETH',
                token1Symbol: 'USDC',
                token0Name: 'Wrapped Ether',
                token1Name: 'USD Coin',
                token0: '0x4200000000000000000000000000000000000006',
                token1: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
                isStablecoinPool: false,
                token0Decimals: 18,
                token1Decimals: 6,
            },
        ],
        message: 'Pool recommendations completed successfully',
    },
};
