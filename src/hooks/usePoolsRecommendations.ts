import { useState } from 'react';
import { RecommendationResponse } from '@/types/backend/pools';

export const usePoolsRecommendations = (
    userIdRaw: string,
    investedAmount: number,
    riskyInvestment: number,
    nonRiskyInvestment: number
) => {
    const [state, setState] = useState({
        isLoading: false,
        isFinished: false,
        response: null as RecommendationResponse | null,
        error: null as string | null,
    });

    const callRecommendations =
        async (): Promise<RecommendationResponse | null> => {
            try {
                setState(prev => ({
                    ...prev,
                    isLoading: true,
                    isFinished: false,
                    error: null,
                }));

                const response = await fetch('/api/pools/recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userIdRaw,
                        investedAmount,
                        riskyInvestment,
                        nonRiskyInvestment,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result =
                    (await response.json()) as RecommendationResponse;

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isFinished: true,
                    response: result,
                }));

                return result;
            } catch (error) {
                console.error('Call recommendations error:', error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isFinished: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to fetch recommendations',
                }));
                throw error;
            }
        };

    return {
        callRecommendations,
        isLoading: state.isLoading,
        isFinished: state.isFinished,
        response: state.response,
        error: state.error,
        isPending: state.isLoading,
        isError: !!state.error,
        data: state.response,
    };
};
