import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI } from '@/utils/abis';
import {
    TransactionState,
    UseUniswapApproveReturn,
    UseUniswapApproveState,
} from '@/types/uniswap/allowance';

export function useUniswapApprove(): UseUniswapApproveReturn {
    const [state, setState] = useState<UseUniswapApproveState>({
        isLoading: false,
        error: null,
        allowance: null,
        isApproved: false,
        transactionState: TransactionState.Idle,
    });

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            allowance: null,
            isApproved: false,
            transactionState: TransactionState.Idle,
        });
    }, []);

    const checkTokenAllowance = useCallback(
        async (
            tokenAddress: string,
            spenderAddress: string,
            walletAddress: string,
            tokenAmount: bigint,
            provider: ethers.providers.Provider
        ): Promise<bigint> => {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                console.log('Checking token allowance for Uniswap...');

                const tokenContract = new ethers.Contract(
                    tokenAddress,
                    ERC20_ABI,
                    provider
                );

                const allowance = await tokenContract.allowance(
                    walletAddress,
                    spenderAddress
                );

                const allowanceBigInt = BigInt(allowance.toString());

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    allowance: allowanceBigInt,
                    isApproved: BigInt(allowance.toString()) >= tokenAmount,
                }));

                return allowanceBigInt;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to check allowance';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                    transactionState: TransactionState.Failed,
                }));
                throw error;
            }
        },
        []
    );

    const approveToken = useCallback(
        async (
            tokenAddress: string,
            spenderAddress: string,
            walletAddress: string,
            tokenAmount: bigint,
            provider: ethers.providers.Provider,
            sendTransaction: (tx: {
                to: string;
                data: string;
                value: bigint;
            }) => Promise<string>
        ): Promise<string> => {
            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                transactionState: TransactionState.Loading,
            }));

            try {
                console.log(
                    'Creating token approval transaction for Uniswap...'
                );

                const tokenContract = new ethers.Contract(
                    tokenAddress,
                    ERC20_ABI,
                    provider
                );

                const transaction =
                    await tokenContract.populateTransaction.approve(
                        spenderAddress,
                        tokenAmount
                    );

                console.log('Approval transaction details:', transaction);

                const txHash = await sendTransaction({
                    to: transaction.to!,
                    data: transaction.data!,
                    value: transaction.value
                        ? BigInt(transaction.value.toString())
                        : BigInt(0),
                });

                console.log('Approval transaction sent. Hash:', txHash);
                console.log('Waiting 10 seconds for confirmation...');
                await new Promise(res => setTimeout(res, 10000));

                // Check new allowance
                const newAllowance = await checkTokenAllowance(
                    tokenAddress,
                    spenderAddress,
                    walletAddress,
                    tokenAmount,
                    provider
                );

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    allowance: newAllowance,
                    isApproved: newAllowance > BigInt(0),
                    transactionState: TransactionState.Success,
                }));

                return txHash;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to approve token';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                    transactionState: TransactionState.Failed,
                }));
                throw error;
            }
        },
        [checkTokenAllowance]
    );

    const revokeToken = useCallback(
        async (
            tokenAddress: string,
            spenderAddress: string,
            walletAddress: string,
            provider: ethers.providers.Provider,
            sendTransaction: (tx: {
                to: string;
                data: string;
                value: bigint;
            }) => Promise<string>
        ): Promise<string> => {
            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                transactionState: TransactionState.Loading,
            }));
            try {
                const tokenContract = new ethers.Contract(
                    tokenAddress,
                    ERC20_ABI,
                    provider
                );
                const transaction =
                    await tokenContract.populateTransaction.approve(
                        spenderAddress,
                        BigInt(0)
                    );
                const txHash = await sendTransaction({
                    to: transaction.to!,
                    data: transaction.data!,
                    value: BigInt(0),
                });
                const newAllowance = await checkTokenAllowance(
                    tokenAddress,
                    spenderAddress,
                    walletAddress,
                    BigInt(0),
                    provider
                );
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    allowance: newAllowance,
                    isApproved: false,
                    transactionState: TransactionState.Success,
                }));
                return txHash;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to revoke token';
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                    transactionState: TransactionState.Failed,
                }));
                throw error;
            }
        },
        [checkTokenAllowance]
    );

    return {
        ...state,
        checkTokenAllowance,
        approveToken,
        revokeToken,
        reset,
    };
}
