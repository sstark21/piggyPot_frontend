// Response from 1inch balance API
export interface BalanceResponse {
    [tokenAddress: string]: string; // token address -> balance in wei
}

// Hook state
export interface UseBalanceState {
    balanceUSD: number | null;
    isLoading: boolean;
    error: string | null;
}

// Hook return type
export interface UseBalanceReturn extends UseBalanceState {
    fetchBalance: (walletAddress: string) => Promise<number>;
    reset: () => void;
}
