import {
  usePoolsRecommendations,
  useOperations,
  useUpdateOperation,
  apiClient,
  HistoryResponse,
  ApiResponse,
  RecommendationResponse,
} from "./client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Example 1: Get pool recommendations
export const usePoolsRecommendationsExample = () => {
  return usePoolsRecommendations();
};

// Example 2: Get user operations
export const useOperationsExample = (userIdRaw: string) => {
  return useOperations(userIdRaw);
};

// Example 3: Update operation
export const useUpdateOperationExample = () => {
  return useUpdateOperation();
};

// Example 4: Complete workflow - Get recommendations and update operation
export const useInvestmentWorkflow = (userIdRaw: string) => {
  const recommendations = usePoolsRecommendations();
  const operations = useOperations(userIdRaw);
  const updateOperation = useUpdateOperation();

  const handleUpdateOperation = (operationData: Record<string, unknown>) => {
    updateOperation.mutate({
      userIdRaw,
      data: operationData,
    });
  };

  return {
    recommendations,
    operations,
    updateOperation: handleUpdateOperation,
    isLoading: recommendations.isLoading || operations.isLoading,
    error: recommendations.error || operations.error,
  };
};

// Example 5: Conditional operations query (only fetch if user exists)
export const useConditionalOperations = (userIdRaw: string | null) => {
  return useQuery({
    queryKey: ["operations", userIdRaw],
    queryFn: () =>
      apiClient.get<HistoryResponse>("/operations", { userIdRaw: userIdRaw! }),
    enabled: !!userIdRaw, // Only run query if userIdRaw exists
  });
};

// Example 6: Optimistic update for operations
export const useOptimisticUpdateOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIdRaw,
      data,
    }: {
      userIdRaw: string;
      data: Record<string, unknown>;
    }) =>
      apiClient.put<ApiResponse<unknown>>(
        `/operations/update?userIdRaw=${userIdRaw}`,
        data
      ),
    onMutate: async ({ userIdRaw, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["operations", userIdRaw] });

      // Snapshot the previous value
      const previousOperations = queryClient.getQueryData<HistoryResponse>([
        "operations",
        userIdRaw,
      ]);

      // Optimistically update to the new value
      if (previousOperations) {
        queryClient.setQueryData<HistoryResponse>(["operations", userIdRaw], {
          ...previousOperations,
          data: previousOperations.data.map((op) => ({
            ...op,
            ...data,
          })),
        });
      }

      // Return a context object with the snapshotted value
      return { previousOperations };
    },
    onError: (err, { userIdRaw }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOperations) {
        queryClient.setQueryData(
          ["operations", userIdRaw],
          context.previousOperations
        );
      }
    },
    onSettled: (data, error, { userIdRaw }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["operations", userIdRaw] });
    },
  });
};

// Example 7: Real-time recommendations with polling
export const useLiveRecommendations = () => {
  return useQuery({
    queryKey: ["pools", "recommendations"],
    queryFn: () =>
      apiClient.get<RecommendationResponse>("/pools/recommendations"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale
  });
};

// Example 8: Error handling with retry
export const useRobustOperations = (userIdRaw: string) => {
  return useQuery({
    queryKey: ["operations", userIdRaw],
    queryFn: () => apiClient.get<HistoryResponse>("/operations", { userIdRaw }),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
