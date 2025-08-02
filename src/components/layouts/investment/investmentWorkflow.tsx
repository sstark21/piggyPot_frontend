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
import { USDC_ADDRESS, USDC_DECIMALS } from '@/config/constants';
import { convertHumanReadableToWei } from '@/utils/converter';
import { ethers } from 'ethers';
import { useUniswapApprove } from '@/hooks/useUniswapApprove';
import { processPoolInvestment } from './processPool';

interface InvestmentWorkflowProps {
    userIdRaw: string;
    amountToInvest: number;
    riskyInvestmentAmountUsd: number;
    conservativeInvestmentAmountUsd: number;
    onProgress: (step: string, progress: number) => void;
    onComplete: () => void;
    onError: (error: string) => void;
}

export function InvestmentWorkflow({
    userIdRaw,
    amountToInvest,
    riskyInvestmentAmountUsd,
    conservativeInvestmentAmountUsd,
    onProgress,
    onComplete,
    onError,
}: InvestmentWorkflowProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [recommendationsReady, setRecommendationsReady] = useState(false);
    const { user } = usePrivy();
    const { wallets } = useWallets();
    const [provider, setProvider] = useState<ethers.providers.Provider | null>(
        null
    );

    console.log('totatl amount to invest: ', amountToInvest);
    console.log('risky amount to invest: ', riskyInvestmentAmountUsd);
    console.log(
        'conservative amount to invest: ',
        conservativeInvestmentAmountUsd
    );

    useEffect(() => {
        const getProvider = async () => {
            const primaryWallet = wallets.find(
                (w: ConnectedWallet) => w.address === user?.wallet?.address
            );

            if (primaryWallet) {
                const provider = new ethers.providers.Web3Provider(
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
        amountToInvest,
        riskyInvestmentAmountUsd,
        conservativeInvestmentAmountUsd
    );

    const { swapTokens } = useSwap();
    const { check1inchAllowance, approve1inchIfNeeded } = use1inchApprove();
    const { checkTokenAllowance, approveToken, revokeToken } =
        useUniswapApprove();
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
            if (isProcessing || !user?.wallet?.address || amountToInvest <= 0)
                return;

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
    }, [user, amountToInvest]);

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

                // Separate pools by risk level: non-risky and risky
                const riskyPools = recommendedPools.filter(
                    (pool: unknown) =>
                        !(pool as { isStablecoinPool: boolean })
                            .isStablecoinPool
                );
                const conservativePools = recommendedPools.filter(
                    (pool: unknown) =>
                        (pool as { isStablecoinPool: boolean }).isStablecoinPool
                );

                // CHECK IF USER HAS ENOUGH USDC TO INVEST
                // THEN CHECK IF 1INCH HAS ALLOWANCE TO SPEND USDC
                if (amountToInvest > 0) {
                    onProgress('Checking USDC allowance...', 20);

                    const totalAmountToInvestBigInt = convertHumanReadableToWei(
                        amountToInvest,
                        USDC_DECIMALS
                    );

                    const allowance = await check1inchAllowance(
                        USDC_ADDRESS,
                        walletAddress,
                        totalAmountToInvestBigInt
                    );

                    console.log('Current wallet allowance for USDC', {
                        current: allowance,
                        toBe: totalAmountToInvestBigInt,
                    });

                    if (allowance < totalAmountToInvestBigInt) {
                        onProgress('Approving USDC...', 25);
                        await approve1inchIfNeeded(
                            USDC_ADDRESS,
                            walletAddress,
                            totalAmountToInvestBigInt,
                            sendTransaction
                        );
                    }
                } else {
                    onError('Amount to invest is 0');
                }

                // SWAP AND MINT UNISWAP V3 POSITIONS FOR RISKY POOL IF IT EXISTS
                if (riskyPools.length > 0) {
                    await processPoolInvestment({
                        poolInfo: riskyPools[0],
                        amountToInvestToPool: riskyInvestmentAmountUsd,
                        walletAddress,
                        onProgress,
                        onComplete,
                        sendTransaction,
                        swapTokens,
                        provider: provider!,
                        checkTokenAllowance,
                        approveToken,
                    });
                }

                // SWAP AND MINT UNISWAP V3 POSITIONS FOR CONSERVATIVE POOL IF IT EXISTS
                if (conservativePools.length > 0) {
                    await processPoolInvestment({
                        poolInfo: conservativePools[0],
                        amountToInvestToPool: conservativeInvestmentAmountUsd,
                        walletAddress,
                        onProgress,
                        onComplete,
                        sendTransaction,
                        swapTokens,
                        provider: provider!,
                        checkTokenAllowance,
                        approveToken,
                    });
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
        if (amountToInvest > 0) processSwaps();
    }, [
        recommendationsReady,
        recommendationsResponse,
        user,
        amountToInvest,
        riskyInvestmentAmountUsd,
        conservativeInvestmentAmountUsd,
    ]);

    return null; // This component doesn't render anything
}
