import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

interface WalletState {
  primaryWallet: any;
  setPrimaryWallet: (wallet: any) => void;
  primaryBalance: string;
  setPrimaryBalance: (balance: string) => void;
  delegateWallet: any;
  setDelegateWallet: (wallet: any) => void;
  delegateBalance: string;
  setDelegateBalance: (balance: string) => void;
}

export const WalletContext = createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {

  const [primaryWallet, setPrimaryWallet] = useState<any>(null);
  const [primaryBalance, setPrimaryBalance] = useState<string>('');
  const [delegateWallet, setDelegateWallet] = useState<any>(null);
  const [delegateBalance, setDelegateBalance] = useState<string>('');

  return (
    <WalletContext.Provider value={{
      primaryWallet,
      setPrimaryWallet,
      primaryBalance,
      setPrimaryBalance,
      delegateWallet,
      setDelegateWallet,
      delegateBalance,
      setDelegateBalance
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallets() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
}