import { useState, useEffect } from "react";
import { usePoolsRecommendations } from "@/hooks/usePoolsRecommendations";
import { useSwap } from "@/hooks/useSwap";
import { useApprove } from "@/hooks/useApprove";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { USDC_DECIMALS } from "@/config/constants";

interface InvestmentWorkflowProps {
  userIdRaw: string;
  amount: number;
  riskyAmount: number;
  conservativeAmount: number;
  onProgress: (step: string, progress: number) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

const convertToBigInt = (amount: number, decimals: number): bigint => {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
};

export function InvestmentWorkflow({
  userIdRaw,
  amount,
  riskyAmount,
  conservativeAmount,
  onProgress,
  onComplete,
  onError,
}: InvestmentWorkflowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendationsReady, setRecommendationsReady] = useState(false);
  const { user } = usePrivy();

  // Initialize hooks
  const {
    callRecommendations,
    isLoading: isRecommendationsLoading,
    isFinished: isRecommendationsFinished,
    response: recommendationsResponse,
    error: recommendationsError,
  } = usePoolsRecommendations(
    userIdRaw,
    amount,
    riskyAmount,
    conservativeAmount
  );

  console.log("recommendationsResponse", recommendationsResponse);
  console.log("isRecommendationsFinished", isRecommendationsFinished);
  console.log("recommendationsError", recommendationsError);

  const { swapTokens } = useSwap();
  const { checkAllowance, approveIfNeeded } = useApprove();
  const { sendTransaction: privySendTransaction } = useSendTransaction();

  const sendTransaction = async (tx: {
    to: string;
    data: string;
    value: bigint;
  }) => {
    const result = await privySendTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value,
    });
    return result.hash;
  };

  // Effect 1: Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (isProcessing || !user?.wallet?.address || amount <= 0) return;

      setIsProcessing(true);
      setRecommendationsReady(false);

      try {
        onProgress("Fetching pool recommendations...", 0);
        await callRecommendations();

        // Wait a bit for the state to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (recommendationsError) {
          throw new Error(
            `Failed to get recommendations: ${recommendationsError}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch recommendations";
        onError(errorMessage);
        setIsProcessing(false);
      }
    };

    fetchRecommendations();
  }, [user, amount]);

  useEffect(() => {
    if (isRecommendationsFinished) {
      if (recommendationsResponse?.data?.recommendations) {
        setRecommendationsReady(true);
        onProgress("Recommendations received, processing swaps...", 25);
      } else {
        onError("No recommendations received");
      }
    }
  }, [
    recommendationsResponse,
    isRecommendationsFinished,
    recommendationsError,
  ]);

  // Effect 2: Process swaps after recommendations are ready
  useEffect(() => {
    const processSwaps = async () => {
      console.log("Current recommendations", recommendationsResponse);

      if (
        !recommendationsReady ||
        !recommendationsResponse?.data?.recommendations ||
        !user?.wallet?.address
      )
        return;

      const walletAddress = user.wallet.address;

      try {
        const recommendedPools =
          recommendationsResponse.data.recommendations || [];
        console.log("Recommended pools:", recommendedPools);

        // Separate pools by risk level
        const riskyPools = recommendedPools.filter(
          (pool: unknown) =>
            !(pool as { isStablecoinPool: boolean }).isStablecoinPool
        );
        const conservativePools = recommendedPools.filter(
          (pool: unknown) =>
            (pool as { isStablecoinPool: boolean }).isStablecoinPool
        );

        console.log("Risky pools:", riskyPools);
        console.log("Conservative pools:", conservativePools);

        // Calculate amounts per pool (handle case where there might be only 1 pool)
        const riskyAmountPerPool =
          riskyPools.length > 0 ? riskyAmount / riskyPools.length : 0;
        const conservativeAmountPerPool =
          conservativePools.length > 0
            ? conservativeAmount / conservativePools.length
            : 0;

        // Check USDC allowance once before processing pools
        const totalRiskyAmount = riskyAmount;
        const totalConservativeAmount = conservativeAmount;
        const totalAmount = totalRiskyAmount + totalConservativeAmount;

        if (totalAmount > 0) {
          onProgress("Checking USDC allowance...", 20);

          const totalAmountBigInt = convertToBigInt(totalAmount, USDC_DECIMALS);

          const allowance = await checkAllowance(
            walletAddress,
            totalAmountBigInt
          );

          if (allowance < totalAmountBigInt) {
            onProgress("Approving USDC...", 22);
            await approveIfNeeded(
              walletAddress,
              totalAmountBigInt,
              sendTransaction
            );
          }
        }

        if (riskyPools.length > 0) {
          for (let i = 0; i < riskyPools.length; i++) {
            const pool = riskyPools[i] as {
              token0: string;
              token1: string;
              token0Decimals: number;
              token1Decimals: number;
            };
            const poolAmount = riskyAmountPerPool;

            onProgress(
              `Swapping tokens for risky pool ${i + 1}/${riskyPools.length}...`,
              25 + (i * 25) / riskyPools.length
            );

            const token0Amount = Math.ceil(poolAmount / 2);
            const token1Amount = poolAmount - token0Amount;

            const token0AmountBigInt = convertToBigInt(token0Amount, 6);
            const token1AmountBigInt = convertToBigInt(token1Amount, 6);

            if (token0Amount > 0) {
              onProgress(
                `Swapping USDC to ${pool.token0}...`,
                25 + (i * 25) / riskyPools.length
              );
              await swapTokens(
                pool.token0,
                token0AmountBigInt.toString(),
                walletAddress
              );
            }

            if (token1Amount > 0) {
              onProgress(
                `Swapping USDC to ${pool.token1}...`,
                25 + (i * 25) / riskyPools.length
              );
              await swapTokens(
                pool.token1,
                token1AmountBigInt.toString(),
                walletAddress
              );
            }
          }
        }

        if (conservativePools.length > 0) {
          for (let i = 0; i < conservativePools.length; i++) {
            const pool = conservativePools[i] as {
              token0: string;
              token1: string;
              token0Decimals: number;
              token1Decimals: number;
            };
            const poolAmount = conservativeAmountPerPool;

            onProgress(
              `Swapping tokens for conservative pool ${i + 1}/${
                conservativePools.length
              }...`,
              50 + (i * 25) / conservativePools.length
            );

            const token0Amount = Math.ceil(poolAmount / 2);
            const token1Amount = poolAmount - token0Amount;

            const token0AmountBigInt = convertToBigInt(token0Amount, 6);
            const token1AmountBigInt = convertToBigInt(token1Amount, 6);

            if (token0Amount > 0) {
              onProgress(
                `Swapping USDC to ${pool.token0}...`,
                50 + (i * 25) / conservativePools.length
              );
              await swapTokens(
                pool.token0,
                token0AmountBigInt.toString(),
                walletAddress
              );
            }

            // Swap USDC to token1
            if (token1Amount > 0) {
              onProgress(
                `Swapping USDC to ${pool.token1}...`,
                50 + (i * 25) / conservativePools.length
              );
              await swapTokens(
                pool.token1,
                token1AmountBigInt.toString(),
                walletAddress
              );
            }
          }
        }

        onProgress("Adding liquidity to pools...", 75);

        // Step 3: Add liquidity (stub for now)
        // TODO: Implement liquidity provision
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate liquidity provision

        onProgress("Investment completed successfully!", 100);
        onComplete();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Investment failed";
        onError(errorMessage);
      } finally {
        setIsProcessing(false);
        setRecommendationsReady(false);
      }
    };

    processSwaps();
  }, [recommendationsReady, recommendationsResponse, user?.wallet?.address]);

  return null; // This component doesn't render anything
}
