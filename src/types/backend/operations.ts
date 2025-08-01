import { RecommendedPool } from "./pools";

export interface Operation {
  operationId: string;
  userId: string;
  operationDate: string;
  investedAmount: number;
  riskyInvestment: number;
  nonRiskyInvestment: number;
  logId: string | null;
  recommendation: string;
  profit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  recommendedPools?: RecommendedPool[];
}

export interface HistoryResponse {
  success: boolean;
  data: Operation[];
}

export interface UpdateOperationData {
  userIdRaw: string;
  data: {
    operationId: string;
    status: string;
    recommendedPools: unknown[];
  };
}
