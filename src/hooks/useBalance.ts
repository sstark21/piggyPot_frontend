import { useState, useCallback } from "react";
import { call1inchAPI } from "@/libs/1inch/callApi";
import { USDC_ADDRESS, USDC_DECIMALS } from "@/config/constants";
import {
  BalanceResponse,
  UseBalanceReturn,
  UseBalanceState,
} from "@/types/1inch/balance";
import { convertWeiToHumanReadable } from "@/utils/converter";

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
            tokens: USDC_ADDRESS, // USDC token
          }
        );

        console.log("Balance response:", balanceRes);

        const usdcBalanceWei = balanceRes[USDC_ADDRESS];

        if (!usdcBalanceWei) {
          throw new Error("USDC balance not found");
        }

        const balanceInUSDC = convertWeiToHumanReadable(
          usdcBalanceWei,
          USDC_DECIMALS
        );

        const balanceUSD = Number(balanceInUSDC.toString());

        console.log("Balance in USDC:", balanceInUSDC);

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
