import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

// Base API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Types for API responses
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Recommendation response interfaces
export interface RecommendedPool {
  poolId: string;
  feeTier: string;
}

export interface Operation {
  operationId: string;
  userId: string;
  operationDate: string;
  investedAmount: number;
  riskyInvestment: number;
  nonRiskyInvestment: number;
  logId: string | null;
  recommendation: string;
  profit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  recommendedPools?: RecommendedPool[];
}

export interface RecommendationResponse {
  success: boolean;
  data: {
    operation: Operation;
  };
}

export interface HistoryResponse {
  success: boolean;
  data: Operation[];
}

// Universal API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, {
      method: "GET",
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// React Query hooks for the three specific endpoints
export const usePoolsRecommendations = () => {
  return useQuery<RecommendationResponse, ApiError>({
    queryKey: ["pools", "recommendations"],
    queryFn: () =>
      apiClient.get<RecommendationResponse>("/pools/recommendations"),
  });
};

export const useOperations = (userIdRaw: string) => {
  return useQuery<HistoryResponse, ApiError>({
    queryKey: ["operations", userIdRaw],
    queryFn: () => apiClient.get<HistoryResponse>("/operations", { userIdRaw }),
  });
};

export const useUpdateOperation = () => {
  return useMutation<
    ApiResponse<unknown>,
    ApiError,
    { userIdRaw: string; data: Record<string, unknown> }
  >({
    mutationFn: ({ userIdRaw, data }) =>
      apiClient.put<ApiResponse<unknown>>(
        `/operations/update?userIdRaw=${userIdRaw}`,
        data
      ),
  });
};
