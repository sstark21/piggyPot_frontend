export interface UpdateOperationData {
    userIdRaw: string;
    data: {
        operationId: string;
        status: string;
        recommendedPools: unknown[];
    };
}

export interface Operation {
    operationId: string;
    userId: string;
    operationDate: string;
    investedAmount: number;
    riskyInvestment: number;
    nonRiskyInvestment: number;
    logId: string;
    status: string;
    recommendedPools: unknown;
    profit: number;
    createdAt: string;
    updatedAt: string;
}

export interface OperationsResponse {
    success: boolean;
    data: Operation[];
}

export interface OperationsState {
    isLoading: boolean;
    error: string | null;
    operations: Operation[];
}

export interface OperationsReturn extends OperationsState {
    fetchOperations: (userIdRaw: string) => Promise<void>;
    updateOperationStatus: (
        operationId: string,
        status:
            | 'RECOMMENDATION_INIT'
            | 'RECOMMENDATION_FINISHED'
            | 'RECOMMENDATION_FAILED'
            | 'DEPOSIT_INIT'
            | 'DEPOSIT_FAILED'
            | 'ACTIVE_INVESTMENT'
            | 'CLOSED_INVESTMENT'
    ) => Promise<void>;
    isPending: boolean;
    isError: boolean;
    data: OperationsResponse | null;
    refetch: () => void;
}
