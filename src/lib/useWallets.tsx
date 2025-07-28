import { useContext } from 'react';
import { WalletContext } from '../WalletsContext';

export function useWallets() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
}