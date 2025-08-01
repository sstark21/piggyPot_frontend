import { useState, useCallback } from "react";
import {
  AllowanceResponse,
  ApproveTransactionResponse,
} from "@/types/1inch/allowance";
import { call1inchAPI } from "@/libs/1inch/callApi";
import { USDC_ADDRESS } from "@/config/constants";
import { UseApproveReturn, UseApproveState } from "@/types/1inch/allowance";

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
      addressToApprove: string,
      walletAddress: string,
      expectedAllowance: bigint
    ): Promise<bigint> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("Checking token allowance...");

        const allowanceRes = await call1inchAPI<AllowanceResponse>(
          "/swap/v6.1/8453/approve/allowance",
          {
            tokenAddress: addressToApprove,
            walletAddress: walletAddress,
          }
        );

        const allowance = BigInt(allowanceRes.allowance);

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
      addressToApprove: string,
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
            tokenAddress: addressToApprove,
            amount: expectedAllowance.toString(),
          }
        );

        console.log("Approval transaction details:", approveTx);

        const txHash = await sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          value: approveTx.value,
        });

        console.log("Approval transaction sent. Hash:", txHash);
        console.log("Waiting 10 seconds for confirmation...");
        await new Promise((res) => setTimeout(res, 10000));

        const newAllowance = await checkAllowance(
          addressToApprove,
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
