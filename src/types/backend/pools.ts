export interface RecommendedPool {
    poolId: string;
    feeTier: string;
    token0: string;
    token1: string;
    token0Symbol: string;
    token1Symbol: string;
    token0Name: string;
    token1Name: string;
    isStablecoinPool: boolean;
    token0Decimals: number;
    token1Decimals: number;
}

export type PoolInfo = Omit<RecommendedPool, 'poolId' | 'isStablecoinPool'>;

export interface RecommendationResponse {
    success: boolean;
    data: {
        operationId: string;
        recommendations: RecommendedPool[];
        message: string;
    };
}
