import { ethers } from 'ethers';

const FAUCET_ADDRESS = "0x411cf09dab9fcf226f4e5578df1e68d22952dd21";

// Полный ABI контракта
const FAUCET_ABI = [
  {"inputs":[{"internalType":"uint256","name":"_withdrawAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Sent","type":"event"},
  {"stateMutability":"payable","type":"fallback"},
  {"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"setWithdrawAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"withdrawAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];

export async function claimEth(wallet: any) {
  try {
    const provider = await wallet.getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    
    // Проверяем сеть
    const network = await ethersProvider.getNetwork();
    console.log('Сеть:', network);
    
    if (network.chainId !== BigInt(11155111)) {
      return { 
        success: false, 
        error: `Неправильная сеть. Нужна Sepolia (11155111), у вас ${network.chainId}` 
      };
    }
    
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
    
    // Проверяем баланс контракта
    const balance = await contract.getBalance();
    console.log('Баланс контракта:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      return { 
        success: false, 
        error: 'Faucet пуст. Попробуйте позже.' 
      };
    }
    
    // Проверяем сумму вывода
    const withdrawAmount = await contract.withdrawAmount();
    console.log('Сумма вывода:', ethers.formatEther(withdrawAmount), 'ETH');
    
    // Проверяем, что на балансе достаточно средств
    if (balance < withdrawAmount) {
      return { 
        success: false, 
        error: `Недостаточно средств в faucet. Доступно: ${ethers.formatEther(balance)} ETH, требуется: ${ethers.formatEther(withdrawAmount)} ETH` 
      };
    }
    
    // Выполняем claim
    const tx = await contract.claim();
    console.log('Транзакция отправлена:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Транзакция подтверждена:', receipt);
    
    return { 
      success: true, 
      hash: tx.hash,
      amount: ethers.formatEther(withdrawAmount)
    };
    
  } catch (error: any) {
    console.error('Ошибка claim:', error);
    
    if (error.message.includes("Faucet empty")) {
      return { 
        success: false, 
        error: 'Faucet пуст. Попробуйте позже.' 
      };
    }
    
    return { success: false, error: error.message };
  }
}