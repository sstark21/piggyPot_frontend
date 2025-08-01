export interface BalanceResponse {
  [tokenAddress: string]: string;
}

export interface UseBalanceState {
  isLoading: boolean;
  error: string | null;
  balanceUSD: number | null;
}

export interface UseBalanceReturn extends UseBalanceState {
  fetchBalance: (walletAddress: string) => Promise<number>;
  reset: () => void;
}
