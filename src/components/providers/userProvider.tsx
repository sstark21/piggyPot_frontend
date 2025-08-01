'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, Wallet } from '@privy-io/react-auth';
import { useBalance } from '@/hooks/useBalance';

interface UserContextType {
    // Privy данные
    user: any;
    authenticated: boolean;
    ready: boolean;
    wallet: Wallet | null;

    // Баланс
    balanceUSD: number | null;
    isBalanceLoading: boolean;
    balanceError: string | null;

    // Методы
    login: (options?: any) => void;
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

    // Устанавливаем кошелек
    useEffect(() => {
        if (user?.wallet) {
            setWallet(user.wallet);
        } else {
            setWallet(null);
        }
    }, [user?.wallet]);

    // Загружаем баланс
    useEffect(() => {
        if (authenticated && wallet?.address && !hasLoadedBalance) {
            console.log('Loading balance for wallet:', wallet.address);
            fetchBalance(wallet.address);
            setHasLoadedBalance(true);
        }
    }, [authenticated, wallet?.address, fetchBalance, hasLoadedBalance]);

    const refreshBalance = () => {
        if (wallet?.address) {
            setHasLoadedBalance(false); // Сбросить флаг для перезагрузки
        }
    };

    const value: UserContextType = {
        // Privy данные
        user,
        authenticated,
        ready,
        wallet,

        // Баланс
        balanceUSD,
        isBalanceLoading,
        balanceError,

        // Методы
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
