// src/hooks/usePortfolio.ts
import { useState, useCallback } from 'react';
import { call1inchAPI } from '@/libs/1inch/callApi';

interface PortfolioResponse {
    total: number;
    by_address: Array<{
        value_usd: number;
        address: string;
    }>;
    by_category: Array<{
        value_usd: number;
        category_id: string;
        category_name: string;
    }>;
    by_protocol_group: Array<{
        value_usd: number;
        protocol_group_id: string;
        protocol_group_name: string;
    }>;
    by_chain: Array<{
        value_usd: number;
        chain_id: number;
        chain_name: string;
    }>;
}

export const usePortfolio = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [portfolioValue, setPortfolioValue] = useState<number | null>(null);
    const [uniswapValue, setUniswapValue] = useState<number | null>(null);

    const fetchPortfolio = useCallback(async (address: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await call1inchAPI<PortfolioResponse>(
                '/portfolio/portfolio/v5.0/general/current_value',
                {
                    addresses: address,
                    chain_id: '8453',
                }
            );

            const value = response.total || 0;
            const uniswapValue =
                response.result.by_protocol_group?.find(
                    group => group.protocol_group_id === 'uniswapv3'
                )?.value_usd || 0;
            console.log('uniswapValue:', uniswapValue, response);
            setPortfolioValue(value);
            setUniswapValue(uniswapValue);
            return value;
        } catch (err) {
            const errorMsg =
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch portfolio';
            setError(errorMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        portfolioValue,
        isLoading,
        error,
        fetchPortfolio,
        uniswapValue,
    };
};
