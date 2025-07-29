import { useState, type ReactNode, useEffect, useCallback } from 'react';
import {
    PrivyProvider,
    usePrivy,
    useWallets as usePrivyWallets,
} from '@privy-io/react-auth';
import {
    createDelegateWallet,
    decryptPrivateKey,
    restoreWallet,
} from './lib/secureWallet';
import { createUser, getBalance, getUser } from './lib/api';
import { mainnet } from 'viem/chains';
import { ethers } from 'ethers';
import './App.css';
import {
    transferToDelegated,
    transferEthWithEthersWallet,
} from './lib/transfer';
import { WalletProvider, useWallets } from './WalletsContext';
// import { FaucetClaim } from './components/FaucetClaim';
import { transferFromDelegatedWithKey } from './lib/transfer';
import { addRpcUrlOverrideToChain } from '@privy-io/chains';
import { defineChain } from 'viem';
import AppKitProvider from './WagmiContext';

const myCustomChain = defineChain({
    id: 31337, // Уникальный ID твоей сети
    name: 'Mainnet Fork',
    network: 'mainnet-fork',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [import.meta.env.VITE_CHAIN_RPC_URL],
            //   webSocket: [import.meta.env.VITE_CHAIN_RPC_URL],
        },
    },
});
const mainnetWithCustomRPC = addRpcUrlOverrideToChain(
    mainnet,
    import.meta.env.VITE_CHAIN_RPC_URL
);

export const Providers = ({ children }: { children: ReactNode }) => {
    const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

    return (
        <PrivyProvider
            appId={privyAppId}
            config={{
                loginMethods: ['email', 'google'],
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                supportedChains: [myCustomChain, mainnet],
                defaultChain: myCustomChain,
            }}
        >
            {children}
        </PrivyProvider>
    );
};

function WhaleWallet() {
    const { primaryWallet } = useWallets();

    const [whaleWallet, setWhaleWallet] = useState<any>(null);
    const [whaleBalance, setWhaleBalance] = useState<string>('');
    const transferAmount = '0.1';

    const whaleAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    const whalePrivateKey =
        '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';

    const fetchWhaleBalance = async () => {
        const balance = await getBalance(whaleAddress);
        setWhaleBalance(Number(balance));
    };

    useEffect(() => {
        const rpcUrl = import.meta.env.VITE_CHAIN_RPC_URL;
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        setWhaleWallet(new ethers.Wallet(whalePrivateKey, provider));

        fetchWhaleBalance();
    }, []);

    return (
        <div className="wallet-info">
            <h3>Whale wallet address:</h3>
            <div className="wallet-details">
                <p>
                    <strong>Address:</strong> <code>{whaleAddress}</code>
                </p>
                <p>
                    <strong>Balance:</strong> <code>{whaleBalance}</code>
                </p>
                <button
                    onClick={() =>
                        transferEthWithEthersWallet(
                            whaleWallet,
                            primaryWallet.address,
                            transferAmount
                        )
                    }
                >
                    Transfer {transferAmount} ETH to primary wallet
                </button>
            </div>
        </div>
    );
}

function DelegateWallet() {
    const {
        delegateWallet,
        setDelegateWallet,
        delegateBalance,
        setDelegateBalance,
        primaryWallet,
    } = useWallets();
    const [loading, setLoading] = useState(false);
    const [userDataFetched, setUserDataFetched] = useState(false);

    const { user } = usePrivy();
    const fetchDelegatePrivateKey = async () => {
        console.log('fetchDelegatePrivateKey', delegateWallet);
        const decryptedDelegatePrivateKey = await decryptPrivateKey(
            delegateWallet.privateKeyEncrypted
        );
        return decryptedDelegatePrivateKey;
    };

    const fetchUserData = useCallback(async () => {
        if (!user?.id || userDataFetched) return;

        console.log('fetchUserData_user', user);
        try {
            const userData = await getUser(user.id);

            console.log('userData', userData);
            if (userData && userData.delegatedWalletHash) {
                const wallet = await restoreWallet(
                    userData.delegatedWalletHash
                );
                const balance = await getBalance(wallet.address);
                setDelegateBalance(balance);
                setDelegateWallet(wallet);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setUserDataFetched(true);
        }
    }, [user?.id, userDataFetched]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const createWallet = async () => {
        setLoading(true);
        try {
            const wallet = await createDelegateWallet();
            setDelegateWallet(wallet);

            if (user?.id) {
                await createUser(user.id, wallet.privateKeyEncrypted);

                const balance = await getBalance(wallet.address);
                setDelegateBalance(balance);
            }
        } catch (error) {
            console.error('Error creating wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-wallet-demo">
            {!delegateWallet && (
                <button
                    onClick={createWallet}
                    disabled={loading}
                    className="create-wallet-button"
                >
                    {loading ? 'Creating...' : 'Create delegated wallet'}
                </button>
            )}

            {delegateWallet && (
                <div className="wallet-info">
                    <h3>Delegate wallet address:</h3>
                    <div className="wallet-details">
                        <p>
                            <strong>Address:</strong>{' '}
                            <code>{delegateWallet.address}</code>
                        </p>
                        <p>
                            <strong>Balance:</strong>{' '}
                            <code>{delegateBalance}</code>
                        </p>
                        <button
                            onClick={async () => {
                                const result =
                                    await transferFromDelegatedWithKey(
                                        await fetchDelegatePrivateKey(), // Расшифрованный приватный ключ
                                        primaryWallet.address,
                                        '0.001'
                                    );
                                if (result.success) {
                                    alert('Перевод успешен!');
                                } else {
                                    alert('Ошибка: ' + result.error);
                                }
                            }}
                        >
                            Transfer back to primary
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function PrimaryWallet() {
    const {
        primaryWallet,
        setPrimaryWallet,
        primaryBalance,
        setPrimaryBalance,
        delegateWallet,
    } = useWallets();
    const [balanceFetched, setBalanceFetched] = useState(false);
    const { authenticated, ready, user } = usePrivy();
    const { wallets } = usePrivyWallets();
    const transferAmount = '0.001';

    console.log('primaryWallet', primaryWallet, wallets[0], delegateWallet);

    useEffect(() => {
        if (ready && authenticated && user?.wallet && !primaryWallet) {
            setPrimaryWallet(user.wallet);
        }
    }, [ready, authenticated, user?.wallet, primaryWallet]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (primaryWallet?.address && !balanceFetched) {
                try {
                    const result = await getBalance(primaryWallet.address);
                    setPrimaryBalance(result);
                    setBalanceFetched(true);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            }
        };
        fetchBalance();
    }, [primaryWallet?.address, balanceFetched]);

    return (
        primaryWallet && (
            <div className="wallet-info">
                <h3>Primary wallet address:</h3>
                <div className="wallet-details">
                    <p>
                        <strong>Address:</strong>{' '}
                        <code>{primaryWallet.address}</code>
                    </p>
                    <p>
                        <strong>Balance:</strong> <code>{primaryBalance}</code>
                    </p>
                    {delegateWallet && (
                        <button
                            onClick={() =>
                                transferToDelegated(
                                    wallets[0],
                                    delegateWallet.address,
                                    transferAmount
                                )
                            }
                        >
                            Transfer {transferAmount} ETH to delegate wallet
                        </button>
                    )}
                </div>
            </div>
        )
    );
}

export function AppContent() {
    const { authenticated, ready, user, login, logout } = usePrivy();

    if (!authenticated && !ready) {
        return (
            <div className="login-container">
                <h1>Welcome to 1inch hackathon project</h1>
                <p>Login to access your wallet</p>
                <button onClick={() => login()} className="login-button">
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>1inch Wallet</h1>
                <div className="user-info">
                    <button onClick={() => logout()} className="logout-button">
                        Logout
                    </button>
                </div>
            </header>

            <main className="app-main">
                <div className="wallet-section">
                    <h2>Your wallets</h2>
                    <PrimaryWallet />
                </div>

                {user?.id && (
                    <div className="agent-wallet-section">
                        <h2>Delegated wallet</h2>
                        <DelegateWallet />
                    </div>
                )}
                <WhaleWallet />
            </main>
        </div>
    );
}

function App() {
    return (
        <AppKitProvider>
            <Providers>
                <WalletProvider>
                    <AppContent />
                </WalletProvider>
            </Providers>
        </AppKitProvider>
    );
}

export default App;
