import { ethers } from 'ethers';
import { getBalance } from './api';

export interface TransferResult {
    success: boolean;
    hash?: string;
    error?: string;
    amount?: string;
}

export interface TransferInfo {
    from: string;
    to: string;
    amount: string;
    gasPrice?: string;
    gasLimit?: string;
}

/**
 * Transfer ETH between wallets
 * @param fromWallet - sender wallet (Privy wallet)
 * @param toAddress - recipient address
 * @param amount - amount in ETH
 * @returns transfer result
 */
export async function transferEth(
    fromWallet: any,
    toAddress: string,
    amount: string
): Promise<TransferResult> {
    console.log('transferEth', fromWallet, toAddress, amount);
    try {
        // Check if fromWallet has the getEthereumProvider method
        if (
            !fromWallet ||
            typeof fromWallet.getEthereumProvider !== 'function'
        ) {
            return {
                success: false,
                error: 'Invalid wallet object',
            };
        }

        // Check sender balance
        const balance = await getBalance(fromWallet.address);
        const amountNum = parseFloat(amount);
        const balanceNum = parseFloat(balance);
        console.log('balanceNum', balanceNum);
        console.log('amountNum', amountNum);

        if (balanceNum < amountNum) {
            return {
                success: false,
                error: `Insufficient funds. Balance: ${balance} ETH, required: ${amount} ETH`,
            };
        }

        // Get provider and signer
        const provider = await fromWallet.getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        // Create transaction
        const amountWei = ethers.parseEther(amount);
        const tx = await signer.sendTransaction({
            to: toAddress,
            value: amountWei,
            gasLimit: 21000, // Standard limit for simple transfers
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        return {
            success: true,
            hash: tx.hash,
            amount: amount,
        };
    } catch (error: any) {
        console.error('Transfer error:', error);
        return {
            success: false,
            error: error.message || 'Unknown transfer error',
        };
    }
}

/**
 * Transfer from primary wallet to delegated wallet
 */
export async function transferToDelegated(
    primaryWallet: any,
    delegatedAddress: string,
    amount: string
): Promise<TransferResult> {
    return await transferEth(primaryWallet, delegatedAddress, amount);
}

/**
 * Transfer from delegated wallet to primary wallet
 */
export async function transferToPrimary(
    delegatedWallet: any,
    primaryAddress: string,
    amount: string
): Promise<TransferResult> {
    return await transferEth(delegatedWallet, primaryAddress, amount);
}

/**
 * Transfer from delegated wallet to another address
 */
export async function transferFromDelegated(
    delegatedWallet: any,
    toAddress: string,
    amount: string
): Promise<TransferResult> {
    return await transferEth(delegatedWallet, toAddress, amount);
}

/**
 * Get gas information for transaction
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
            value: amountWei,
        });

        return {
            gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
            gasLimit: gasLimit.toString(),
        };
    } catch (error) {
        console.error('Gas estimation error:', error);
        return {
            gasPrice: '0',
            gasLimit: '21000',
        };
    }
}

/**
 * Transfer from delegated wallet to primary wallet using private key
 */
export async function transferFromDelegatedWithKey(
    delegatedPrivateKey: string,
    primaryAddress: string,
    amount: string
): Promise<TransferResult> {
    try {
        // Create wallet from private key
        const wallet = new ethers.Wallet(delegatedPrivateKey);

        // Create provider for Sepolia
        const provider = new ethers.JsonRpcProvider(
            import.meta.env.VITE_CHAIN_RPC_URL
        );

        // Connect wallet to provider
        const connectedWallet = wallet.connect(provider);

        console.log('connectedWallet', connectedWallet);

        // Check balance
        const balance = await provider.getBalance(wallet.address);
        const amountWei = ethers.parseEther(amount);

        if (balance < amountWei) {
            return {
                success: false,
                error: `Insufficient funds. Balance: ${ethers.formatEther(balance)} ETH, required: ${amount} ETH`,
            };
        }

        // Send transaction
        const tx = await connectedWallet.sendTransaction({
            to: primaryAddress,
            value: amountWei,
            gasLimit: 21000,
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        return {
            success: true,
            hash: tx.hash,
            amount: amount,
        };
    } catch (error: any) {
        console.error('Transfer error:', error);
        return {
            success: false,
            error: error.message || 'Unknown transfer error',
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
            gasLimit: 21000,
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        return {
            success: true,
            hash: tx.hash,
            amount: amount,
        };
    } catch (error: any) {
        console.error('Transfer error:', error);
        return {
            success: false,
            error: error.message || 'Unknown transfer error',
        };
    }
}

// /**
//  * Transfer from delegated wallet to primary wallet (simplified version)
//  */
// export async function transferFromDelegated(
//   delegatedWallet: any,
//   primaryAddress: string,
//   amount: string
// ): Promise<TransferResult> {
//   return await transferEth(delegatedWallet, primaryAddress, amount);
// }
