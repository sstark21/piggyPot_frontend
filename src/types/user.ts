
export interface UserWallet {
    address: string;
    chainId?: number;
    isConnected: boolean;
}

export interface UserBalance {
    balanceUSD: number;
    isLoading: boolean;
    error: string | null;
}

export interface UserSwapState {
    txHash: string | null;
    isSuccess: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface UserProfile {
    id: string;
    email?: string;
    wallet: UserWallet;
    balance: UserBalance;
    swapState: UserSwapState;
    preferences?: {
        defaultSlippage: number;
        favoriteTokens: string[];
    };
}

// Hook state
export interface UseUserState {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
}

// Hook methods
export interface UseUserReturn extends UseUserState {
    // Core methods
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;

    // Balance operations
    refreshBalance: (walletAddress: string) => Promise<number>;

    // Allowance operations
    checkAllowance: (
        tokenAddress: string,
        walletAddress: string
    ) => Promise<bigint>;
    approveIfNeeded: (
        tokenAddress: string,
        walletAddress: string,
        requiredAmount: bigint,
        sendTransaction: (tx: {
            to: string;
            data: string;
            value: bigint;
        }) => Promise<string>
    ) => Promise<void>;

    // Swap operations
    swapTokens: (
        sourceToken: string,
        destinationToken: string,
        amount: string,
        walletAddress: string
    ) => Promise<void>;

    // Utilities
    resetError: () => void;
    updatePreferences: (
        preferences: Partial<UserProfile['preferences']>
    ) => void;
}
