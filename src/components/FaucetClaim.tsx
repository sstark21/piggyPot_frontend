import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { claimEth } from '../lib/faucet';

export function FaucetClaim() {
  const { wallets } = useWallets();
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!wallets.length) return;
    
    setClaiming(true);
    const result = await claimEth(wallets[0]);
    setClaiming(false);
    
    if (result.success) {
      alert('Успешно! Получено 0.01 ETH');
    } else {
      alert('Ошибка: ' + result.error);
    }
  };

  return (
    <div className="faucet-section">
      <h2>Получить ETH (Faucet)</h2>
      
      {wallets.length === 0 ? (
        <p>Подключите кошелек для получения ETH</p>
      ) : (
        <div className="faucet-content">
          <div className="wallet-info">
            <p><strong>Адрес:</strong> <code>{wallets[0].address}</code></p>
            <p><strong>Контракт:</strong> <code>0x411cf09dab9fcf226f4e5578df1e68d22952dd21</code></p>
          </div>
          
          <button 
            onClick={handleClaim}
            disabled={claiming}
            className="claim-button"
          >
            {claiming ? 'Получение...' : 'Получить 0.01 ETH'}
          </button>
        </div>
      )}
    </div>
  );
}