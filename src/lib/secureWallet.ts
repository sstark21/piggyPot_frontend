import { ethers, Wallet } from 'ethers';

const secret = import.meta.env.VITE_MASTER_SECRET;

export async function createDelegateWallet() {
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    privateKeyEncrypted: await encryptPrivateKey(wallet.privateKey),
    publicKey: wallet.publicKey,
  };
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return await crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPrivateKey(privateKey: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptPrivateKey(encrypted: string): Promise<string> {
  try {
    console.log('Пытаемся расшифровать:', encrypted);
    console.log('Длина строки:', encrypted.length);
    console.log('Первые 50 символов:', encrypted.substring(0, 50));
    
    const key = await deriveKey(secret);
    
    // Проверяем, что строка не пустая
    if (!encrypted || encrypted.length === 0) {
      throw new Error('Пустая строка для расшифровки');
    }
    
    const combined = new Uint8Array(
      atob(encrypted).split('').map(char => char.charCodeAt(0))
    );
    
    console.log('Размер combined:', combined.length);
    
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    const result = decoder.decode(decrypted);
    console.log('Успешно расшифровано');
    return result;
  } catch (error) {
    console.error('Ошибка расшифровки:', error);
    console.error('Входные данные:', encrypted);
    throw error;
  }
}


export async function restoreWallet(encrypted: string): Promise<any> {
    const decryptedKey = await decryptPrivateKey(encrypted);
    const wallet = new Wallet(decryptedKey);
    
    return {
        wallet,
        address: wallet.address,
        privateKeyEncrypted: encrypted
    };
}