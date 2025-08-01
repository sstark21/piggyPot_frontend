import { useState, useCallback } from "react";
import { AllowanceResponse, ApproveTransactionResponse } from "@/types/1inch";
import { call1inchAPI } from "@/libs/1inch/callApi";
import { formatUnits } from "ethers";

interface UseApproveState {
  isLoading: boolean;
  error: string | null;
  allowance: bigint | null;
  isApproved: boolean;
}

interface UseApproveReturn extends UseApproveState {
  checkAllowance: (
    tokenAddress: string,
    walletAddress: string,
    expectedAllowance: bigint
  ) => Promise<bigint>;
  approveIfNeeded: (
    tokenAddress: string,
    walletAddress: string,
    requiredAmount: bigint,
    sendTransaction: (tx: {
      to: string;
      data: string;
      value: bigint;
    }) => Promise<string>
  ) => Promise<void>;
  reset: () => void;
}

export function useApprove(): UseApproveReturn {
  const [state, setState] = useState<UseApproveState>({
    isLoading: false,
    error: null,
    allowance: null,
    isApproved: false,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      allowance: null,
      isApproved: false,
    });
  }, []);

  const checkAllowance = useCallback(
    async (
      tokenAddress: string,
      walletAddress: string,
      expectedAllowance: bigint
    ): Promise<bigint> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("Checking token allowance...");

        const allowanceRes = await call1inchAPI<AllowanceResponse>(
          "/swap/v6.1/8453/approve/allowance",
          {
            tokenAddress: tokenAddress,
            walletAddress: walletAddress,
          }
        );

        const allowance = BigInt(allowanceRes.allowance);
        console.log("Allowance in ETH:", formatUnits(allowance, 18));

        setState((prev) => ({
          ...prev,
          isLoading: false,
          allowance,
          isApproved: allowance >= expectedAllowance,
        }));

        return allowance;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to check allowance";
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

  const approveIfNeeded = useCallback(
    async (
      tokenAddress: string,
      walletAddress: string,
      expectedAllowance: bigint,
      sendTransaction: (tx: {
        to: string;
        data: string;
        value: bigint;
      }) => Promise<string>
    ): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("Insufficient allowance. Creating approval transaction...");

        const approveTx = await call1inchAPI<ApproveTransactionResponse>(
          "/swap/v6.1/8453/approve/transaction",
          {
            tokenAddress: tokenAddress,
            amount: expectedAllowance.toString(),
          }
        );

        console.log("Approval transaction details:", approveTx);

        // Use the provided transaction sender function
        const txHash = await sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          value: approveTx.value,
        });

        console.log("Approval transaction sent. Hash:", txHash);
        console.log("Waiting 10 seconds for confirmation...");
        await new Promise((res) => setTimeout(res, 10000));

        // Re-check allowance after approval
        const newAllowance = await checkAllowance(
          tokenAddress,
          walletAddress,
          expectedAllowance
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          allowance: newAllowance,
          isApproved: newAllowance >= expectedAllowance,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to approve token";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [checkAllowance]
  );

  return {
    ...state,
    checkAllowance,
    approveIfNeeded,
    reset,
  };
}
