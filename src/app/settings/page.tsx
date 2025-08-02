'use client';

import { useState } from 'react';
import { ConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useUniswapApprove } from '@/hooks/useUniswapApprove';
import { ERC20_ABI } from '@/utils/abis';

export default function SettingsPage() {
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const { revokeToken } = useUniswapApprove();
    const { sendTransaction } = usePrivy();

    // State for revoke
    const [revokeTokenAddress, setRevokeTokenAddress] = useState('');
    const [revokeSpenderAddress, setRevokeSpenderAddress] = useState('');
    const [isRevoking, setIsRevoking] = useState(false);

    // State for transfer
    const [transferTokenAddress, setTransferTokenAddress] = useState('');
    const [transferToAddress, setTransferToAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    const getProvider = async () => {
        const primaryWallet = wallets.find(
            (w: ConnectedWallet) => w.address === user?.wallet?.address
        );
        if (primaryWallet) {
            return new ethers.providers.Web3Provider(
                await primaryWallet.getEthereumProvider()
            );
        }
        return null;
    };

    const handleRevoke = async () => {
        if (!revokeTokenAddress || !revokeSpenderAddress) {
            alert('Please fill in all fields');
            return;
        }

        setIsRevoking(true);
        try {
            const provider = await getProvider();
            if (!provider) {
                throw new Error('No provider available');
            }

            const txHash = await revokeToken(
                revokeTokenAddress,
                revokeSpenderAddress,
                user?.wallet?.address || '',
                provider,
                async tx => {
                    const result = await sendTransaction({
                        to: tx.to,
                        data: tx.data,
                        value: tx.value,
                    });
                    return result.hash;
                }
            );

            alert(`Revoke successful! Hash: ${txHash}`);
            setRevokeTokenAddress('');
            setRevokeSpenderAddress('');
        } catch (error) {
            console.error('Revoke error:', error);
            alert(`Revoke failed: ${error}`);
        } finally {
            setIsRevoking(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferTokenAddress || !transferToAddress || !transferAmount) {
            alert('Please fill in all fields');
            return;
        }

        setIsTransferring(true);
        try {
            const provider = await getProvider();
            if (!provider) {
                throw new Error('No provider available');
            }

            // Create token contract
            const tokenContract = new ethers.Contract(
                transferTokenAddress,
                ERC20_ABI,
                provider
            );

            // Get token decimals
            const decimals = await tokenContract.decimals();
            const amountWei = BigInt(
                parseFloat(transferAmount) * Math.pow(10, decimals)
            );

            // Create transfer transaction
            const transaction =
                await tokenContract.populateTransaction.transfer(
                    transferToAddress,
                    amountWei
                );

            // Send transaction
            const result = await sendTransaction({
                to: transaction.to!,
                data: transaction.data!,
                value: BigInt(0), // ERC20 transfers don't send ETH
            });

            alert(`Transfer successful! Hash: ${result.hash}`);
            setTransferTokenAddress('');
            setTransferToAddress('');
            setTransferAmount('');
        } catch (error) {
            console.error('Transfer error:', error);
            alert(`Transfer failed: ${error}`);
        } finally {
            setIsTransferring(false);
        }
    };

    if (!user?.wallet?.address) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p>Please connect your wallet to access settings.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            {/* Revoke Token Section */}
            <div className="mb-8 p-6 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">
                    Revoke Token Approval
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Token Address
                        </label>
                        <input
                            type="text"
                            value={revokeTokenAddress}
                            onChange={e =>
                                setRevokeTokenAddress(e.target.value)
                            }
                            placeholder="0x..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Spender Address (to revoke)
                        </label>
                        <input
                            type="text"
                            value={revokeSpenderAddress}
                            onChange={e =>
                                setRevokeSpenderAddress(e.target.value)
                            }
                            placeholder="0x..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        onClick={handleRevoke}
                        disabled={isRevoking}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {isRevoking ? 'Revoking...' : 'Revoke Approval'}
                    </button>
                </div>
            </div>

            {/* Transfer Token Section */}
            <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Transfer Tokens</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Token Address
                        </label>
                        <input
                            type="text"
                            value={transferTokenAddress}
                            onChange={e =>
                                setTransferTokenAddress(e.target.value)
                            }
                            placeholder="0x..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            To Address
                        </label>
                        <input
                            type="text"
                            value={transferToAddress}
                            onChange={e => setTransferToAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={transferAmount}
                            onChange={e => setTransferAmount(e.target.value)}
                            placeholder="0.0"
                            step="0.000001"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        onClick={handleTransfer}
                        disabled={isTransferring}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isTransferring ? 'Transferring...' : 'Transfer Tokens'}
                    </button>
                </div>
            </div>

            {/* Wallet Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Connected Wallet</h3>
                <p className="text-sm text-gray-600 break-all">
                    {user?.wallet?.address}
                </p>
            </div>
        </div>
    );
}
