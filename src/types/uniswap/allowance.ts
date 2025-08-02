import { ethers } from 'ethers';

export interface UniswapTokenAllowanceFunctionsDefinitions {
    checkTokenAllowance: (
        tokenAddress: string,
        spenderAddress: string,
        walletAddress: string,
        tokenAmount: bigint,
        provider: ethers.providers.Provider
    ) => Promise<bigint>;
    approveToken: (
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
    ) => Promise<string>;
    revokeToken: (
        tokenAddress: string,
        spenderAddress: string,
        walletAddress: string,
        provider: ethers.providers.Provider,
        sendTransaction: (tx: {
            to: string;
            data: string;
            value: bigint;
        }) => Promise<string>
    ) => Promise<string>;
    reset: () => void;
}

export enum TransactionState {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Failed = 'failed',
}

export interface UseUniswapApproveState {
    isLoading: boolean;
    error: string | null;
    allowance: bigint | null;
    isApproved: boolean;
    transactionState: TransactionState;
}

export type UseUniswapApproveReturn = UseUniswapApproveState &
    UniswapTokenAllowanceFunctionsDefinitions;
