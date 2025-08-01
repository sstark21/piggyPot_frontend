import { Hex } from "viem";

export interface UseSwapState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  isSuccess: boolean;
}

export interface UseSwapReturn extends UseSwapState {
  swapTokens: (
    destinationToken: string,
    amount: string,
    walletAddress: string
  ) => Promise<void>;
  reset: () => void;
}

export type TransactionPayload = { to: Hex; data: Hex; value: bigint };
export type TxResponse = { tx: TransactionPayload };
