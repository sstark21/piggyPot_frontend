import { useState, useCallback } from 'react';
import { call1inchAPI } from '@/libs/1inch/callApi';

const USE_MOCK_BALANCE = true;

interface PortfolioResponse {
    result: Array<{
        address: string;
        value_usd: number;
    }>;
    meta: Record<string, unknown>;
}

interface UseBalanceState {
    isLoading: boolean;
    error: string | null;
    balanceUSD: number | null;
}

interface UseBalanceReturn extends UseBalanceState {
    fetchBalance: (walletAddress: string) => Promise<number>;
    reset: () => void;
}

export function useBalance(): UseBalanceReturn {
    const [state, setState] = useState<UseBalanceState>({
        isLoading: false,
        error: null,
        balanceUSD: null,
    });

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            balanceUSD: null,
        });
    }, []);

    const fetchBalance = useCallback(
        async (walletAddress: string): Promise<number> => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                if (USE_MOCK_BALANCE) {
                    // Mock data
                    console.log('Using mock balance data');
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

                    const mockBalance = 12345.67; // Mock balance value
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        balanceUSD: mockBalance,
                    }));

                    return mockBalance;
                }
                console.log('Fetching wallet balance...');

                const balanceRes = await call1inchAPI<PortfolioResponse>(
                    '/portfolio/portfolio/v4/general/current_value',
                    {
                        addresses: walletAddress,
                    }
                );

                console.log('Balance response:', balanceRes);

                // Find the balance for the specific wallet address
                const walletBalance = balanceRes.result.find(
                    item =>
                        item.address.toLowerCase() ===
                        walletAddress.toLowerCase()
                );

                if (!walletBalance) {
                    throw new Error('Wallet balance not found');
                }

                const balanceUSD = walletBalance.value_usd;
                console.log('Balance USD:', balanceUSD);

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    balanceUSD,
                }));

                return balanceUSD;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch balance';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                throw error;
            }
        },
        []
    );

    return {
        ...state,
        fetchBalance,
        reset,
    };
}
