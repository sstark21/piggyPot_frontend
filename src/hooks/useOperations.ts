import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/api/client";
import { HistoryResponse, ApiError } from "@/libs/api/client";
import { useState, useEffect } from "react";

export const useOperations = (userIdRaw: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [response, setResponse] = useState<HistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery<HistoryResponse, ApiError>({
    queryKey: ["operations", userIdRaw],
    queryFn: () =>
      apiClient.get<HistoryResponse>(`/operations?userIdRaw=${userIdRaw}`),
    enabled: !!userIdRaw,
  });

  useEffect(() => {
    if (query.isLoading) {
      setIsLoading(true);
      setIsFinished(false);
      setError(null);
    } else if (query.isSuccess) {
      setResponse(query.data);
      setIsFinished(true);
      setIsLoading(false);
    } else if (query.isError) {
      setError(query.error?.message || "Failed to fetch operations");
      setIsLoading(false);
      setIsFinished(false);
    }
  }, [
    query.isLoading,
    query.isSuccess,
    query.isError,
    query.data,
    query.error,
  ]);

  const callOperations = () => {
    if (userIdRaw) {
      query.refetch();
    }
  };

  return {
    callOperations,
    isLoading,
    isFinished,
    response,
    error,
    isPending: query.isPending,
    isError: query.isError,
    data: query.data,
    refetch: query.refetch,
  };
};
