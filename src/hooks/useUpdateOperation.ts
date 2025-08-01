import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { ApiError } from "@/libs/api/client";
import { useState } from "react";

interface UpdateOperationData {
  userIdRaw: string;
  data: {
    operationId: string;
    status: string;
    recommendedPools: unknown[];
  };
}

export const useUpdateOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [response, setResponse] = useState<void | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<void, ApiError, UpdateOperationData>({
    mutationFn: ({ userIdRaw, data }) =>
      apiClient.put<void>(`/operations/update?userIdRaw=${userIdRaw}`, data),
    onMutate: () => {
      setIsLoading(true);
      setIsFinished(false);
      setError(null);
    },
    onSuccess: () => {
      setResponse(undefined);
      setIsFinished(true);
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
      setIsFinished(false);
    },
  });

  const callUpdateOperation = async (data: UpdateOperationData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in onError callback
    }
  };

  return {
    callUpdateOperation,
    isLoading,
    isFinished,
    response,
    error,
    isPending: mutation.isPending,
    isError: mutation.isError,
    data: mutation.data,
  };
};
