import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { RecommendationResponse, ApiError } from "@/libs/api/client";
import { useState } from "react";
import { poolsRecommendationsMock } from "@/mocks/recommendations";

export const usePoolsRecommendations = (
  userIdRaw: string,
  investedAmount: number,
  riskyInvestment: number,
  nonRiskyInvestment: number
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<RecommendationResponse, ApiError, void>({
    mutationFn: async () => {
      // Mock the API call with mock data
      console.log("Mocking pool recommendations with:", {
        userIdRaw,
        investedAmount,
        riskyInvestment,
        nonRiskyInvestment,
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock data
      return poolsRecommendationsMock as RecommendationResponse;
    },
    onMutate: () => {
      setIsLoading(true);
      setIsFinished(false);
      setError(null);
    },
    onSuccess: (data) => {
      console.log("Mock data received:", data);
      setResponse(data);
      setIsFinished(true);
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
      setIsFinished(false);
    },
  });

  const callRecommendations = async () => {
    try {
      const result = await mutation.mutateAsync();
      console.log("Call recommendations result:", result);
      return result;
    } catch (error) {
      console.error("Call recommendations error:", error);
      // Error is handled in onError callback
    }
  };

  return {
    callRecommendations,
    isLoading,
    isFinished,
    response: response || mutation.data, // Return either local state or mutation data
    error,
    isPending: mutation.isPending,
    isError: mutation.isError,
    data: mutation.data,
  };
};
