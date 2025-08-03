// src/hooks/useHistory.ts
import { useState, useCallback } from 'react';
import { call1inchAPI } from '@/libs/1inch/callApi';

interface HistoryResponse {
    txs: Array<{
        tx_hash: string;
        block_number: number;
        timestamp: number;
        from: string;
        to: string;
        value: string;
        gas_price: string;
        gas_used: number;
        status: number;
        method_name?: string;
        method_signature?: string;
        decoded_input?: string;
        decoded_output?: string;
    }>;
    total: number;
    page: number;
    limit: number;
}

export const useHistory = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryResponse['txs']>([]);

    const fetchHistory = useCallback(
        async (address: string, chainId: string = '8453') => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await call1inchAPI<HistoryResponse>(
                    `/history/v2.0/history/${address}/events`,
                    {
                        wallet_address: address,
                        limit: '50',
                        page: '1',
                    }
                );

                setHistory(response.txs);
                return response.txs;
            } catch (err) {
                const errorMsg =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch history';
                setError(errorMsg);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        history,
        isLoading,
        error,
        fetchHistory,
    };
};
