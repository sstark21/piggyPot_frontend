import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { appConfig } from "@/config";

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
  token0: string;
  token1: string;
  token0Decimals: number;
  token1Decimals: number;
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
    operationId: string;
    recommendations: {
      poolId: string;
      feeTier: string;
      token0: string;
      token1: string;
      isStablecoinPool: boolean;
      token0Decimals: number;
      token1Decimals: number;
    }[];
    message: string;
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

  // POST request
  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
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
export const apiClient = new ApiClient(appConfig.backend.baseUrl);
