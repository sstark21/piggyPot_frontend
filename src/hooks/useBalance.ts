import { useState, useCallback } from "react";
import { call1inchAPI } from "@/libs/1inch/callApi";

interface BalanceResponse {
  [tokenAddress: string]: string; // e.g., {"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913":"800358"}
}

interface UseBalanceState {
  isLoading: boolean;
  error: string | null;
  balanceUSD: number | null;
}

interface UseBalanceReturn extends UseBalanceState {
  fetchBalance: (walletAddress: string) => Promise<number>;
  reset: () => void;
}

// Helper function to convert wei to human readable format
const convertWeiToHumanReadable = (
  weiAmount: string,
  decimals: number
): number => {
  const weiBigInt = BigInt(weiAmount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = weiBigInt / divisor;
  const remainder = weiBigInt % divisor;

  // Convert to number with proper decimal places
  const remainderStr = remainder.toString().padStart(decimals, "0");
  const decimalPart = parseFloat(`0.${remainderStr}`);

  return Number(wholePart) + decimalPart;
};

export function useBalance(): UseBalanceReturn {
  const [state, setState] = useState<UseBalanceState>({
    isLoading: false,
    error: null,
    balanceUSD: null,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      balanceUSD: null,
    });
  }, []);

  const fetchBalance = useCallback(
    async (walletAddress: string): Promise<number> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("Fetching wallet balance...");

        // Use the 1inch API to make the request
        const balanceRes = await call1inchAPI<BalanceResponse>(
          `/balance/v1.2/8453/balances/${walletAddress}`,
          {
            tokens: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC token
          }
        );

        console.log("Balance response:", balanceRes);

        // Get USDC balance from response
        const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
        const usdcBalanceWei = balanceRes[usdcAddress];

        if (!usdcBalanceWei) {
          throw new Error("USDC balance not found");
        }

        // Convert balance from wei to human readable format (USDC has 6 decimals)
        const balanceInUSDC = convertWeiToHumanReadable(usdcBalanceWei, 6);

        // For now, assume 1 USDC = 1 USD (you can add price fetching later if needed)
        const balanceUSD = balanceInUSDC;

        console.log("Balance in USDC:", balanceInUSDC);
        console.log("Balance USD:", balanceUSD);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          balanceUSD,
        }));

        return balanceUSD;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch balance";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    fetchBalance,
    reset,
  };
}
