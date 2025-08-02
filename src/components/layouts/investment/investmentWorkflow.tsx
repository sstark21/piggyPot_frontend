import { useState, useEffect } from 'react';
import { usePoolsRecommendations } from '@/hooks/usePoolsRecommendations';
import { useSwap } from '@/hooks/useSwap';
import { use1inchApprove } from '@/hooks/use1inchApprove';
import {
    ConnectedWallet,
    usePrivy,
    useSendTransaction,
    useWallets,
} from '@privy-io/react-auth';
import {
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    USDC_ADDRESS,
    USDC_DECIMALS,
} from '@/config/constants';
import { convertHumanReadableToWei } from '@/utils/converter';
import { constructPosition, mintPosition } from '@/libs/uniswap/position';
import { ethers } from 'ethers';
import { useUniswapApprove } from '@/hooks/useUniswapApprove';
import {
    getTokenPrices,
    convertUSDToTokenAmount,
} from '@/libs/1inch/getTokenPrices';

interface InvestmentWorkflowProps {
    userIdRaw: string;
    amount: number;
    riskyAmount: number;
    conservativeAmount: number;
    onProgress: (step: string, progress: number) => void;
    onComplete: () => void;
    onError: (error: string) => void;
}

export function InvestmentWorkflow({
    userIdRaw,
    amount,
    riskyAmount,
    conservativeAmount,
    onProgress,
    onComplete,
    onError,
}: InvestmentWorkflowProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [recommendationsReady, setRecommendationsReady] = useState(false);
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );

    useEffect(() => {
        const getProvider = async () => {
            const primaryWallet = wallets.find(
                (w: ConnectedWallet) => w.address === user?.wallet?.address
            );

            if (primaryWallet) {
                const provider = new ethers.BrowserProvider(
                    await primaryWallet.getEthereumProvider()
                );
                setProvider(provider);
            }
        };

        getProvider();
    }, [wallets]);

    // Initialize hooks
    const {
        callRecommendations,
        isLoading: isRecommendationsLoading,
        isFinished: isRecommendationsFinished,
        response: recommendationsResponse,
        error: recommendationsError,
    } = usePoolsRecommendations(
        userIdRaw,
        amount,
        riskyAmount,
        conservativeAmount
    );

    console.log('recommendationsResponse', recommendationsResponse);
    console.log('isRecommendationsFinished', isRecommendationsFinished);
    console.log('recommendationsError', recommendationsError);

    const { swapTokens } = useSwap();
    const { check1inchAllowance, approve1inchIfNeeded } = use1inchApprove();
    const { checkTokenAllowance, approveToken } = useUniswapApprove();
    const { sendTransaction: privySendTransaction } = useSendTransaction();

    const sendTransaction = async (tx: {
        to: string;
        data: string;
        value: bigint;
    }) => {
        const result = await privySendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value,
        });
        return result.hash;
    };

    // Effect 1: Fetch recommendations
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (isProcessing || !user?.wallet?.address || amount <= 0) return;

            setIsProcessing(true);
            setRecommendationsReady(false);

            try {
                onProgress('Fetching pool recommendations...', 0);
                await callRecommendations();

                // Wait a bit for the state to update
                await new Promise(resolve => setTimeout(resolve, 100));

                if (recommendationsError) {
                    throw new Error(
                        `Failed to get recommendations: ${recommendationsError}`
                    );
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch recommendations';
                onError(errorMessage);
                setIsProcessing(false);
            }
        };

        fetchRecommendations();
    }, [user, amount]);

    useEffect(() => {
        if (isRecommendationsFinished) {
            if (recommendationsResponse?.data?.recommendations) {
                setRecommendationsReady(true);
                onProgress('Recommendations received, processing swaps...', 25);
            } else {
                onError('No recommendations received');
            }
        }
    }, [
        recommendationsResponse,
        isRecommendationsFinished,
        recommendationsError,
    ]);

    // Effect 2: Process swaps after recommendations are ready
    useEffect(() => {
        const processSwaps = async () => {
            console.log('Current recommendations', recommendationsResponse);

            if (
                !recommendationsReady ||
                !recommendationsResponse?.data?.recommendations ||
                !user?.wallet?.address
            )
                return;

            const walletAddress = user.wallet.address;

            try {
                const recommendedPools =
                    recommendationsResponse.data.recommendations || [];
                console.log('Recommended pools:', recommendedPools);

                // Separate pools by risk level
                const riskyPools = recommendedPools.filter(
                    (pool: unknown) =>
                        !(pool as { isStablecoinPool: boolean })
                            .isStablecoinPool
                );
                const conservativePools = recommendedPools.filter(
                    (pool: unknown) =>
                        (pool as { isStablecoinPool: boolean }).isStablecoinPool
                );

                console.log('riskyAmount', riskyAmount);
                console.log('conservativeAmount', conservativeAmount);
                // console.log('Risky pools:', riskyPools);
                // console.log('Conservative pools:', conservativePools);

                // Calculate amounts per pool (handle case where there might be only 1 pool)
                const riskyAmountPerPool =
                    riskyPools.length > 0 ? riskyAmount / riskyPools.length : 0;
                const conservativeAmountPerPool =
                    conservativePools.length > 0
                        ? conservativeAmount / conservativePools.length
                        : 0;

                // Check USDC allowance once before processing pools
                const totalRiskyAmount = riskyAmount;
                const totalConservativeAmount = conservativeAmount;
                const totalAmount = totalRiskyAmount + totalConservativeAmount;

                if (totalAmount > 0) {
                    onProgress('Checking USDC allowance...', 20);

                    const totalAmountBigInt = convertHumanReadableToWei(
                        totalAmount,
                        USDC_DECIMALS
                    );

                    const allowance = await check1inchAllowance(
                        USDC_ADDRESS,
                        walletAddress,
                        totalAmountBigInt
                    );

                    console.log('Current wallet allowance for USDC', {
                        allowance,
                        totalAmountBigInt,
                    });

                    if (allowance < totalAmountBigInt) {
                        console.log('Approving USDC for a primary wallet...');
                        onProgress('Approving USDC...', 25);
                        await approve1inchIfNeeded(
                            USDC_ADDRESS,
                            walletAddress,
                            totalAmountBigInt,
                            sendTransaction
                        );
                    }
                }

                if (riskyPools.length > 0) {
                    for (let i = 0; i < riskyPools.length; i++) {
                        const pool = riskyPools[i] as {
                            token0: string;
                            token1: string;
                            token0Decimals: number;
                            token1Decimals: number;
                            feeTier: string;
                            token0Symbol: string;
                            token1Symbol: string;
                            token0Name: string;
                            token1Name: string;
                        };
                        const poolAmount = riskyAmountPerPool;

                        onProgress(
                            `Swapping tokens for risky pool ${i + 1}/${riskyPools.length}...`,
                            30 + (i * 15) / riskyPools.length
                        );

                        // Get token prices from 1inch
                        const tokenPrices = await getTokenPrices([
                            pool.token0,
                            pool.token1,
                        ]);

                        // Calculate token amounts based on USD value and current prices
                        const token0AmountUSD = poolAmount / 2; // Half in token0
                        const token1AmountUSD = poolAmount / 2; // Half in token1

                        // Convert USD amounts to token amounts using current prices
                        const token0AmountBigInt = convertUSDToTokenAmount(
                            token0AmountUSD,
                            pool.token0,
                            pool.token0Decimals,
                            tokenPrices[pool.token0.toLowerCase()]
                        );
                        const token1AmountBigInt = convertUSDToTokenAmount(
                            token1AmountUSD,
                            pool.token1,
                            pool.token1Decimals,
                            tokenPrices[pool.token1.toLowerCase()]
                        );

                        console.log('Token prices:', tokenPrices);
                        console.log('pool amount in USD', poolAmount);
                        console.log(
                            'token0Amount in USD risky',
                            token0AmountUSD
                        );
                        console.log(
                            'token1Amount in USD risky',
                            token1AmountUSD
                        );

                        console.log(
                            'token0Amount in a token price (token0):',
                            token0AmountUSD
                        );
                        console.log(
                            'token1Amount in a token price (token1):',
                            token1AmountUSD
                        );

                        console.log(
                            'token0Amount in BigInt risky',
                            token0AmountBigInt
                        );
                        console.log(
                            'token1Amount in BigInt risky',
                            token1AmountBigInt
                        );

                        if (token0AmountUSD > 0) {
                            onProgress(
                                `Swapping USDC to ${pool.token0Symbol}...`,
                                30 + (i * 15) / riskyPools.length
                            );
                            // await swapTokens(
                            //     pool.token0,
                            //     token0AmountBigInt.toString(),
                            //     walletAddress
                            // );
                        }

                        if (token1AmountUSD > 0) {
                            onProgress(
                                `Swapping USDC to ${pool.token1Symbol}...`,
                                30 + (i * 15) / riskyPools.length
                            );
                            // await swapTokens(
                            //     pool.token1,
                            //     token1AmountBigInt.toString(),
                            //     walletAddress
                            // );
                        }

                        onProgress(
                            'Approving tokens for adding them to liquidity pool...',
                            45 + (i * 15) / riskyPools.length
                        );

                        const token0AllowanceForUniswap =
                            await checkTokenAllowance(
                                pool.token0,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token0AmountBigInt,
                                provider!
                            );

                        console.log(
                            `Checking allowance for Uniswap ${pool.token0Symbol}:`,
                            {
                                token0AllowanceForUniswap,
                                token0AmountBigInt,
                            }
                        );

                        if (token0AllowanceForUniswap < token0AmountBigInt) {
                            onProgress(`Approving ${pool.token0Symbol}...`, 50);
                            await approveToken(
                                pool.token0,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token0AmountBigInt,
                                provider!,
                                sendTransaction
                            );
                        }

                        const token1AllowanceForUniswap =
                            await checkTokenAllowance(
                                pool.token1,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token1AmountBigInt,
                                provider!
                            );

                        console.log(
                            `Checking allowance for Uniswap ${pool.token1Symbol}:`,
                            {
                                token0AllowanceForUniswap,
                                token0AmountBigInt,
                            }
                        );

                        if (token1AllowanceForUniswap < token1AmountBigInt) {
                            onProgress(`Approving ${pool.token1Symbol}...`, 55);
                            await approveToken(
                                pool.token1,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token1AmountBigInt,
                                provider!,
                                sendTransaction
                            );
                        }

                        // if (
                        //     token0AllowanceForUniswap <= token0AmountBigInt &&
                        //     token1AllowanceForUniswap <= token1AmountBigInt
                        // ) {
                        console.log('Minting position for risky pool', i + 1);
                        onProgress(
                            `Minting position for risky pool ${i + 1}...`,
                            60 + (i * 10) / riskyPools.length
                        );

                        // Use default token info since recommendations don't include symbols/names
                        const fee = Number(pool.feeTier);

                        console.log('Fee for a pool:', fee);

                        const position = await constructPosition(
                            pool.token0,
                            pool.token1,
                            pool.token0Decimals,
                            pool.token1Decimals,
                            pool.token0Symbol,
                            pool.token1Symbol,
                            pool.token0Name,
                            pool.token1Name,
                            fee,
                            token0AmountBigInt,
                            token1AmountBigInt,
                            provider!
                        );

                        console.log('Position for Uniswap:', position);

                        // Mint position
                        const txHash = await mintPosition(
                            walletAddress,
                            position,
                            sendTransaction
                        );

                        console.log(
                            `Position minted for risky pool ${i + 1}:`,
                            txHash
                        );
                    }
                    // }
                }

                if (conservativePools.length > 0) {
                    for (let i = 0; i < conservativePools.length; i++) {
                        const pool = conservativePools[i] as {
                            token0: string;
                            token1: string;
                            token0Decimals: number;
                            token1Decimals: number;
                            token0Symbol: string;
                            token1Symbol: string;
                            token0Name: string;
                            token1Name: string;
                            feeTier: string;
                        };
                        const poolAmount = conservativeAmountPerPool;

                        onProgress(
                            `Swapping tokens for conservative pool ${i + 1}/${
                                conservativePools.length
                            }...`,
                            70 + (i * 10) / conservativePools.length
                        );

                        const token0Amount = Math.ceil(poolAmount / 2);
                        const token1Amount = poolAmount - token0Amount;

                        const token0AmountBigInt = convertHumanReadableToWei(
                            token0Amount,
                            6
                        );
                        const token1AmountBigInt = convertHumanReadableToWei(
                            token1Amount,
                            6
                        );

                        if (token0Amount > 0) {
                            onProgress(
                                `Swapping USDC to ${pool.token0Symbol}...`,
                                70 + (i * 10) / conservativePools.length
                            );
                            // await swapTokens(
                            //     pool.token0,
                            //     token0AmountBigInt.toString(),
                            //     walletAddress
                            // );
                        }

                        // Swap USDC to token1
                        if (token1Amount > 0) {
                            onProgress(
                                `Swapping USDC to ${pool.token1Symbol}...`,
                                70 + (i * 10) / conservativePools.length
                            );
                            // await swapTokens(
                            //     pool.token1,
                            //     token1AmountBigInt.toString(),
                            //     walletAddress
                            // );
                        }

                        onProgress(
                            'Adding liquidity to pool...',
                            80 + (i * 10) / conservativePools.length
                        );

                        const token0AllowanceForUniswap =
                            await checkTokenAllowance(
                                pool.token0,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token0AmountBigInt,
                                provider!
                            );

                        if (token0AllowanceForUniswap < token0AmountBigInt) {
                            onProgress(`Approving ${pool.token0Symbol}...`, 85);
                            await approveToken(
                                pool.token0,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token0AmountBigInt,
                                provider!,
                                sendTransaction
                            );
                        }

                        const token1AllowanceForUniswap =
                            await checkTokenAllowance(
                                pool.token1,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token1AmountBigInt,
                                provider!
                            );

                        if (token1AllowanceForUniswap < token1AmountBigInt) {
                            onProgress(`Approving ${pool.token1Symbol}...`, 90);
                            await approveToken(
                                pool.token1,
                                NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
                                walletAddress,
                                token1AmountBigInt,
                                provider!,
                                sendTransaction
                            );
                        }
                    }
                }

                onProgress('Adding liquidity to pools...', 95);

                onProgress('Investment completed successfully!', 100);
                onComplete();
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Investment failed';
                onError(errorMessage);
            } finally {
                setIsProcessing(false);
                setRecommendationsReady(false);
            }
        };

        processSwaps();
    }, [recommendationsReady, recommendationsResponse, user?.wallet?.address]);

    return null; // This component doesn't render anything
}
