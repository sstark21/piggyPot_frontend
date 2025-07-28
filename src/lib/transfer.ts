import { ethers } from 'ethers';
import { getBalance } from './api';

// Интерфейс для результата перевода
export interface TransferResult {
  success: boolean;
  hash?: string;
  error?: string;
  amount?: string;
}

// Интерфейс для информации о переводе
export interface TransferInfo {
  from: string;
  to: string;
  amount: string;
  gasPrice?: string;
  gasLimit?: string;
}

/**
 * Перевод ETH между кошельками
 * @param fromWallet - кошелек отправителя (Privy wallet)
 * @param toAddress - адрес получателя
 * @param amount - сумма в ETH
 * @returns результат перевода
 */
export async function transferEth(
  fromWallet: any, 
  toAddress: string, 
  amount: string
): Promise<TransferResult> {
    console.log('transferEth', fromWallet, toAddress, amount);
  try {
    // Проверяем, что fromWallet имеет метод getEthereumProvider
    if (!fromWallet || typeof fromWallet.getEthereumProvider !== 'function') {
      return {
        success: false,
        error: 'Неправильный объект кошелька'
      };
    }

    // Проверяем баланс отправителя
    const balance = await getBalance(fromWallet.address);
    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(balance);
    console.log('balanceNum', balanceNum);
    console.log('amountNum', amountNum);

    if (balanceNum < amountNum) {
      return {
        success: false,
        error: `Недостаточно средств. Баланс: ${balance} ETH, требуется: ${amount} ETH`
      };
    }

    // Получаем провайдер и signer
    const provider = await fromWallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Создаем транзакцию
    const amountWei = ethers.parseEther(amount);
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountWei,
      gasLimit: 21000 // Стандартный лимит для простых переводов
    });

    console.log('Транзакция отправлена:', tx.hash);
    
    // Ждем подтверждения
    const receipt = await tx.wait();
    console.log('Транзакция подтверждена:', receipt);

    return {
      success: true,
      hash: tx.hash,
      amount: amount
    };

  } catch (error: any) {
    console.error('Ошибка перевода:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка при переводе'
    };
  }
}

/**
 * Перевод от primary wallet к delegated wallet
 */
export async function transferToDelegated(
  primaryWallet: any,
  delegatedAddress: string,
  amount: string
): Promise<TransferResult> {
  return await transferEth(primaryWallet, delegatedAddress, amount);
}

/**
 * Перевод от delegated wallet к primary wallet
 */
export async function transferToPrimary(
  delegatedWallet: any,
  primaryAddress: string,
  amount: string
): Promise<TransferResult> {
  return await transferEth(delegatedWallet, primaryAddress, amount);
}

/**
 * Перевод от delegated wallet к другому адресу
 */
export async function transferFromDelegated(
  delegatedWallet: any,
  toAddress: string,
  amount: string
): Promise<TransferResult> {
  return await transferEth(delegatedWallet, toAddress, amount);
}

/**
 * Получить информацию о газе для транзакции
 */
export async function getGasEstimate(
  fromWallet: any,
  toAddress: string,
  amount: string
): Promise<{ gasPrice: string; gasLimit: string }> {
  try {
    const provider = await fromWallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const amountWei = ethers.parseEther(amount);
    const gasPrice = await ethersProvider.getFeeData();
    const gasLimit = await signer.estimateGas({
      to: toAddress,
      value: amountWei
    });

    return {
      gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
      gasLimit: gasLimit.toString()
    };
  } catch (error) {
    console.error('Ошибка оценки газа:', error);
    return {
      gasPrice: '0',
      gasLimit: '21000'
    };
  }
} 

/**
 * Перевод от delegated wallet к primary wallet используя приватный ключ
 */
export async function transferFromDelegatedWithKey(
  delegatedPrivateKey: string,
  primaryAddress: string,
  amount: string
): Promise<TransferResult> {
  try {
    // Создаем кошелек из приватного ключа
    const wallet = new ethers.Wallet(delegatedPrivateKey);
    
    // Создаем провайдер для Sepolia
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_CHAIN_RPC_URL);
    
    // Подключаем кошелек к провайдеру
      const connectedWallet = wallet.connect(provider);
      
      console.log('connectedWallet', connectedWallet);
    
    // Проверяем баланс
    const balance = await provider.getBalance(wallet.address);
    const amountWei = ethers.parseEther(amount);
    
    if (balance < amountWei) {
      return {
        success: false,
        error: `Недостаточно средств. Баланс: ${ethers.formatEther(balance)} ETH, требуется: ${amount} ETH`
      };
    }
    
    // Отправляем транзакцию
    const tx = await connectedWallet.sendTransaction({
      to: primaryAddress,
      value: amountWei,
      gasLimit: 21000
    });
    
    console.log('Транзакция отправлена:', tx.hash);
    
    // Ждем подтверждения
    const receipt = await tx.wait();
    console.log('Транзакция подтверждена:', receipt);
    
    return {
      success: true,
      hash: tx.hash,
      amount: amount
    };
    
  } catch (error: any) {
    console.error('Ошибка перевода:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка при переводе'
    };
  }
}

export async function transferEthWithEthersWallet(
  fromWallet: ethers.Wallet,
  toAddress: string,
  amount: string
): Promise<TransferResult> {
  try {
    const amountWei = ethers.parseEther(amount);
    const tx = await fromWallet.sendTransaction({
      to: toAddress,
      value: amountWei,
      gasLimit: 21000
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return {
      success: true,
      hash: tx.hash,
      amount: amount
    };
  } catch (error: any) {
    console.error('Transfer error:', error);
    return {
      success: false,
      error: error.message || 'Unknown transfer error'
    };
  }
}

// /**
//  * Перевод от delegated wallet к primary wallet (упрощенная версия)
//  */
// export async function transferFromDelegated(
//   delegatedWallet: any,
//   primaryAddress: string,
//   amount: string
// ): Promise<TransferResult> {
//   return await transferEth(delegatedWallet, primaryAddress, amount);
// } 