import { useState, useCallback } from 'react';
import { TxResponse } from '@/types/1inch/swap';
import { call1inchAPI } from '@/libs/1inch/callApi';
import { useSendTransaction } from '@privy-io/react-auth';
import { USDC_ADDRESS } from '@/config/constants';
import { UseSwapReturn, UseSwapState } from '@/types/1inch/swap';

export function useSwap(): UseSwapReturn {
    const { sendTransaction } = useSendTransaction();
    const [state, setState] = useState<UseSwapState>({
        isLoading: false,
        error: null,
        txHash: null,
        isSuccess: false,
    });

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            txHash: null,
            isSuccess: false,
        });
    }, []);

    const swapTokens = useCallback(
        async (
            destinationToken: string,
            amount: string,
            walletAddress: string
        ): Promise<void> => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                console.log('Creating swap transaction...');

                const swapParams = {
                    src: USDC_ADDRESS,
                    dst: destinationToken,
                    amount: amount,
                    from: walletAddress,
                    slippage: '1',
                    disableEstimate: 'false',
                    allowPartialFill: 'false',
                };

                if (swapParams.dst === swapParams.src) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: 'Cannot swap to the same token. Skipping swap',
                    }));
                    return;
                }

                console.log('Swap parameters:', swapParams);

                const swapTx = await call1inchAPI<TxResponse>(
                    '/swap/v6.1/8453/swap',
                    swapParams
                );

                console.log('Swap transaction details:', swapTx);

                const txHash = await sendTransaction({
                    to: swapTx.tx.to,
                    data: swapTx.tx.data,
                    value: swapTx.tx.value,
                });

                console.log('Swap transaction sent. Hash:', txHash);
                console.log('Waiting 10 seconds for confirmation...');
                await new Promise(res => setTimeout(res, 10000));

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    txHash: txHash.hash,
                    isSuccess: true,
                }));
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to swap tokens';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));
                throw error;
            }
        },
        [sendTransaction]
    );

    return {
        ...state,
        swapTokens,
        reset,
    };
}
