export interface RecommendedPool {
  poolId: string;
  feeTier: string;
  token0: string;
  token1: string;
  token0Decimals: number;
  token1Decimals: number;
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    operationId: string;
    recommendations: {
      poolId: string;
      feeTier: string;
      token0: string;
      token1: string;
      isStablecoinPool: boolean;
      token0Decimals: number;
      token1Decimals: number;
    }[];
    message: string;
  };
}
