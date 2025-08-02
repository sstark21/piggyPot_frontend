'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    LoginModalOptions,
    usePrivy,
    User,
    Wallet,
} from '@privy-io/react-auth';
import { MouseEvent } from 'react';
import { useBalance } from '@/hooks/useBalance';

interface UserContextType {
    // Privy data
    user: User | null;
    authenticated: boolean;
    ready: boolean;
    wallet: Wallet | null;

    // balance
    balanceUSD: number | null;
    isBalanceLoading: boolean;
    balanceError: string | null;

    // Methods
    login: (
        options?: LoginModalOptions | MouseEvent<Element, MouseEvent>
    ) => void;
    logout: () => Promise<void>;
    refreshBalance: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user, authenticated, ready, login, logout } = usePrivy();
    const {
        fetchBalance,
        balanceUSD,
        isLoading: isBalanceLoading,
        error: balanceError,
    } = useBalance();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [hasLoadedBalance, setHasLoadedBalance] = useState(false);

    // Set wallet
    useEffect(() => {
        if (user?.wallet) {
            setWallet(user.wallet);
        } else {
            setWallet(null);
        }
    }, [user?.wallet]);

    // Load balance
    useEffect(() => {
        if (authenticated && wallet?.address && !hasLoadedBalance) {
            console.log('Loading balance for wallet:', wallet.address);
            fetchBalance(wallet.address);
            setHasLoadedBalance(true);
        }
    }, [authenticated, wallet?.address, fetchBalance, hasLoadedBalance]);

    const refreshBalance = () => {
        if (wallet?.address) {
            setHasLoadedBalance(false); // reset flag to reload
        }
    };

    const value: UserContextType = {
        // Privy data
        user,
        authenticated,
        ready,
        wallet,

        // balance
        balanceUSD,
        isBalanceLoading,
        balanceError,

        // Methods
        login,
        logout,
        refreshBalance,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within UserProvider');
    }
    return context;
}
