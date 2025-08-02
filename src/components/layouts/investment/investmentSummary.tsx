import { VStack, HStack, Text, Box, Button } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { InvestmentWorkflow } from './investmentWorkflow';
import { defineIssue } from '@/utils/issuesProcessing';

export const InvestmentSummary = ({
    amountToInvest,
    investmentTypeShare,
    isProcessing,
    setIsProcessing,
}: {
    amountToInvest: number;
    investmentTypeShare: {
        risky: number;
        conservative: number;
        riskyAmount: number;
        conservativeAmount: number;
    };
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;
}) => {
    const { user } = usePrivy();
    const [currentStep, setCurrentStep] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    // Calculate investment amounts
    const riskyAmount = (amountToInvest * investmentTypeShare.risky) / 100;
    const conservativeAmount =
        (amountToInvest * investmentTypeShare.conservative) / 100;

    const handleStartInvestment = () => {
        if (!user?.id) {
            console.error('User not authenticated');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setIsCompleted(false);
        setProgress(0);
    };

    const handleProgress = (step: string, progressValue: number) => {
        setCurrentStep(step);
        setProgress(progressValue);
    };

    const handleComplete = () => {
        setIsCompleted(true);
        setIsProcessing(false);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setIsProcessing(false);
    };

    if (!amountToInvest) {
        return (
            <VStack gap={4} alignItems="center">
                <Text fontSize="lg" color="gray.500">
                    No investment amount specified
                </Text>
            </VStack>
        );
    }

    return (
        <VStack gap={6} alignItems="center" w="full">
            <Text fontSize="2xl" fontWeight="bold">
                Investment Summary
            </Text>

            <Box
                w="full"
                p={6}
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                bg="gray.50"
            >
                <VStack gap={4} alignItems="stretch">
                    {/* Total Investment Amount */}
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={2}>
                            Total Investment Amount
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                            ${amountToInvest.toFixed(2)}
                        </Text>
                    </Box>

                    <Box h="1px" bg="gray.200" />

                    {/* Asset Allocation Summary */}
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                            Asset Allocation
                        </Text>

                        <VStack gap={3} alignItems="stretch">
                            {/* Risky Assets */}
                            <HStack
                                justify="space-between"
                                p={3}
                                bg="red.50"
                                borderRadius="md"
                            >
                                <VStack alignItems="start" gap={1}>
                                    <Text fontWeight="bold" color="red.600">
                                        Risky Assets
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Higher potential returns, higher risk
                                    </Text>
                                </VStack>
                                <VStack alignItems="end" gap={1}>
                                    <Text
                                        fontSize="xl"
                                        fontWeight="bold"
                                        color="red.600"
                                    >
                                        {investmentTypeShare.risky}%
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        $
                                        {investmentTypeShare.riskyAmount.toFixed(
                                            2
                                        )}
                                    </Text>
                                </VStack>
                            </HStack>

                            {/* Conservative Assets */}
                            <HStack
                                justify="space-between"
                                p={3}
                                bg="green.50"
                                borderRadius="md"
                            >
                                <VStack alignItems="start" gap={1}>
                                    <Text fontWeight="bold" color="green.600">
                                        Conservative Assets
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        Lower risk, stable returns
                                    </Text>
                                </VStack>
                                <VStack alignItems="end" gap={1}>
                                    <Text
                                        fontSize="xl"
                                        fontWeight="bold"
                                        color="green.600"
                                    >
                                        {investmentTypeShare.conservative}%
                                    </Text>
                                    <Text fontSize="lg" fontWeight="bold">
                                        $
                                        {investmentTypeShare.conservativeAmount.toFixed(
                                            2
                                        )}
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </Box>

                    {!isProcessing ? (
                        <Button
                            onClick={handleStartInvestment}
                            colorScheme="green"
                            size="lg"
                            disabled={!user?.id}
                        >
                            Start Investment
                        </Button>
                    ) : (
                        <VStack gap={4} w="full">
                            <Text fontSize="md" textAlign="center">
                                {currentStep}
                            </Text>

                            <Box
                                w="full"
                                bg="gray.200"
                                borderRadius="md"
                                h="8px"
                            >
                                <Box
                                    bg="green.500"
                                    h="full"
                                    borderRadius="md"
                                    w={`${progress}%`}
                                    transition="width 0.3s ease"
                                />
                            </Box>

                            <Text fontSize="sm" color="gray.600">
                                {Math.round(progress)}% complete
                            </Text>
                        </VStack>
                    )}

                    <Box h="1px" bg="gray.200" />
                </VStack>
                {/* Error handling */}
                {error && (
                    <Text color="red.500" fontSize="sm" textAlign="center">
                        Error: {defineIssue(error)}
                    </Text>
                )}

                {/* Success message */}
                {isCompleted && (
                    <Text color="green.500" fontSize="sm" textAlign="center">
                        Investment completed successfully!
                    </Text>
                )}

                {/* Workflow component - only render when processing */}
                {isProcessing && user?.id && (
                    <InvestmentWorkflow
                        userIdRaw={user.id}
                        amountToInvest={amountToInvest}
                        riskyInvestmentAmountUsd={riskyAmount}
                        conservativeInvestmentAmountUsd={conservativeAmount}
                        onProgress={handleProgress}
                        onComplete={handleComplete}
                        onError={handleError}
                    />
                )}
            </Box>
        </VStack>
    );
};
