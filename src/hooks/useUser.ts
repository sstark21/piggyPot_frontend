'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useApprove } from './useApprove';
import { useBalance } from './useBalance';
import { useSwap } from './useSwap';
import type {
    UseUserState,
    UseUserReturn,
    UserProfile,
    UserWallet,
    UserBalance,
    UserSwapState,
} from '@/types/user';

export function useUser(): UseUserReturn {
    // Use existing Privy hooks
    const { login, logout, user: privyUser, authenticated, ready } = usePrivy();
    const wallets = useWallets();
    const { sendTransaction } = useSendTransaction();

    // Use existing custom hooks
    const approveHook = useApprove();
    const balanceHook = useBalance();
    const swapHook = useSwap();

    const [state, setState] = useState<UseUserState>({
        user: null,
        isLoading: false,
        error: null,
        isConnected: false,
    });

    // Create wallet object from Privy data
    const createUserWallet = useCallback(
        (privyUser: unknown, wallet: unknown): UserWallet => {
            const primaryWallet = wallet as any;
            return {
                address:
                    primaryWallet?.address ||
                    (privyUser as any)?.wallet?.address?.toString() ||
                    '',
                chainId:
                    primaryWallet?.chainId ||
                    (privyUser as any)?.wallet?.chainId,
                isConnected:
                    !!primaryWallet?.address ||
                    !!(privyUser as any)?.wallet?.address,
            };
        },
        []
    );

    // Update user state when Privy state changes
    useEffect(() => {
        if (!ready) return;

        if (authenticated && privyUser) {
            setState(prev => ({ ...prev, isLoading: true }));

            const wallet = createUserWallet(privyUser, wallets);

            const userProfile: UserProfile = {
                id: (privyUser as any)?.id || wallet.address,
                email: (privyUser as any)?.email?.address,
                wallet,
                balance: {
                    balanceUSD: 0, // Start with 0, will be updated by separate effect
                    isLoading: false,
                    error: null,
                },
                swapState: {
                    txHash: null,
                    isSuccess: false,
                    isLoading: false,
                    error: null,
                },
                preferences: {
                    defaultSlippage: 1,
                    favoriteTokens: ['USDC', 'ETH'],
                },
            };

            setState(prev => ({
                ...prev,
                user: userProfile,
                isLoading: false,
                isConnected: true,
                error: null,
            }));

            // Auto-load balance when user connects
            if (wallet.address) {
                balanceHook.fetchBalance(wallet.address);
            }
        } else {
            // Reset state when user is not authenticated
            setState({
                user: null,
                isLoading: false,
                error: null,
                isConnected: false,
            });
        }
    }, [authenticated, privyUser, wallets, ready, createUserWallet]);

    // Separate effect to update balance when it changes
    useEffect(() => {
        if (state.user && balanceHook.balanceUSD !== null) {
            setState(prev => ({
                ...prev,
                user: prev.user ? {
                    ...prev.user,
                    balance: {
                        balanceUSD: balanceHook.balanceUSD || 0,
                        isLoading: balanceHook.isLoading,
                        error: balanceHook.error,
                    }
                } : null
            }));
        }
    }, [balanceHook.balanceUSD, balanceHook.isLoading, balanceHook.error]);

    // Separate effect to update swap state when it changes
    useEffect(() => {
        if (state.user) {
            setState(prev => ({
                ...prev,
                user: prev.user ? {
                    ...prev.user,
                    swapState: {
                        txHash: swapHook.txHash,
                        isSuccess: swapHook.isSuccess,
                        isLoading: swapHook.isLoading,
                        error: swapHook.error,
                    }
                } : null
            }));
        }
    }, [swapHook.txHash, swapHook.isSuccess, swapHook.isLoading, swapHook.error]);

    // Hook methods - delegate to existing hooks
    const connect = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            await login();
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to connect',
            }));
        }
    }, [login]);

    const disconnect = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            await logout();
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to disconnect',
            }));
        }
    }, [logout]);

    // Balance operations - delegate to useBalance hook
    const refreshBalance = useCallback(
        async (walletAddress: string) => {
            return await balanceHook.fetchBalance(walletAddress);
        },
        [balanceHook.fetchBalance]
    );

    // Allowance operations - delegate to useApprove hook
    const checkAllowance = useCallback(
        async (tokenAddress: string, walletAddress: string) => {
            return await approveHook.checkAllowance(
                tokenAddress,
                walletAddress
            );
        },
        [approveHook]
    );

    const approveIfNeeded = useCallback(
        async (
            tokenAddress: string,
            walletAddress: string,
            requiredAmount: bigint,
            sendTransactionFn: (tx: {
                to: string;
                data: string;
                value: bigint;
            }) => Promise<string>
        ) => {
            await approveHook.approveIfNeeded(
                tokenAddress,
                walletAddress,
                requiredAmount,
                sendTransactionFn
            );
        },
        [approveHook.approveIfNeeded]
    );

    // Swap operations - delegate to useSwap hook
    const swapTokens = useCallback(
        async (
            sourceToken: string,
            destinationToken: string,
            amount: string,
            walletAddress: string
        ) => {
            await swapHook.swapTokens(
                sourceToken,
                destinationToken,
                amount,
                walletAddress
            );
        },
        [swapHook.swapTokens]
    );

    // Reset all errors from child hooks
    const resetError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
        approveHook.reset();
        balanceHook.reset();
        swapHook.reset();
    }, [approveHook.reset, balanceHook.reset, swapHook.reset]);

    // Update user preferences
    const updatePreferences = useCallback(
        (preferences: Partial<UserProfile['preferences']>) => {
            setState(prev => ({
                ...prev,
                user: prev.user
                    ? {
                          ...prev.user,
                          preferences: {
                              ...prev.user.preferences,
                              ...preferences,
                          } as UserProfile['preferences'],
                      }
                    : null,
            }));
        },
        []
    );

    return {
        ...state,
        connect,
        disconnect,
        refreshBalance,
        checkAllowance,
        approveIfNeeded,
        swapTokens,
        resetError,
        updatePreferences,
    };
}
