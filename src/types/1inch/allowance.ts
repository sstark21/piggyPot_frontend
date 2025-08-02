import { Hex } from 'viem';

export interface UseApproveState {
    isLoading: boolean;
    error: string | null;
    allowance: bigint | null;
    isApproved: boolean;
}

export interface UseApproveReturn extends UseApproveState {
    check1inchAllowance: (
        addressToApprove: string,
        walletAddress: string,
        expectedAllowance: bigint
    ) => Promise<bigint>;
    approve1inchIfNeeded: (
        addressToApprove: string,
        walletAddress: string,
        requiredAmount: bigint,
        sendTransaction: (tx: {
            to: string;
            data: string;
            value: bigint;
        }) => Promise<string>
    ) => Promise<void>;
    reset: () => void;
}

export type AllowanceResponse = { allowance: string };

export type ApproveTransactionResponse = {
    to: Hex;
    data: Hex;
    value: bigint;
    gas?: string;
};
