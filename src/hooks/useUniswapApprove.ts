import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS } from '@/config/constants';
import { ERC20_ABI } from '@/utils/abis';

export enum TransactionState {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Failed = 'failed',
}

interface UseUniswapApproveState {
    isLoading: boolean;
    error: string | null;
    allowance: bigint | null;
    isApproved: boolean;
    transactionState: TransactionState;
}

interface UseUniswapApproveReturn extends UseUniswapApproveState {
    checkTokenAllowance: (
        tokenAddress: string,
        spenderAddress: string,
        walletAddress: string,
        tokenAmount: bigint,
        provider: ethers.BrowserProvider
    ) => Promise<bigint>;
    approveToken: (
        tokenAddress: string,
        spenderAddress: string,
        walletAddress: string,
        tokenAmount: bigint,
        provider: ethers.BrowserProvider,
        sendTransaction: (tx: {
            to: string;
            data: string;
            value: bigint;
        }) => Promise<string>
    ) => Promise<string>;
    reset: () => void;
}

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
            provider: ethers.BrowserProvider
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

                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    allowance,
                    isApproved: allowance >= tokenAmount,
                }));

                return allowance;
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
            provider: ethers.BrowserProvider,
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

                // const MAX = ethers.MaxUint256;

                const transaction =
                    await tokenContract.approve.populateTransaction(
                        spenderAddress,
                        tokenAmount
                    );

                console.log('Approval transaction details:', transaction);

                const txHash = await sendTransaction({
                    to: transaction.to!,
                    data: transaction.data!,
                    value: transaction.value || BigInt(0),
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

    return {
        ...state,
        checkTokenAllowance,
        approveToken,
        reset,
    };
}
