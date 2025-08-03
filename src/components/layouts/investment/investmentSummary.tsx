import { VStack, Text, Box, Button, Flex } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { InvestmentWorkflow } from './investmentWorkflow';
import { defineIssue } from '@/utils/issuesProcessing';
import { formatUSD } from '@/libs';
import { IoIosArrowRoundBack } from 'react-icons/io';

export const InvestmentSummary = ({
    amountToInvest,
    investmentTypeShare,
    isProcessing,
    setIsProcessing,
    onBack,
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
    onBack: () => void;
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
        <Flex
            gap={4}
            alignItems="center"
            w="full"
            maxW="600px"
            flexDirection="column"
            justifyContent="center"
            mt={100}
        >
            <Box display="flex" flexDirection="column" alignItems="center">
                <Flex alignItems="center" gap={2} position="relative">
                    <Button
                        onClick={onBack}
                        variant="ghost"
                        color="white"
                        _hover={{ backgroundColor: 'transparent' }}
                        style={{
                            position: 'absolute',
                            left: '-70px',
                            top: '13px',
                        }}
                    >
                        <IoIosArrowRoundBack
                            style={{
                                width: '60px',
                                height: '60px',
                            }}
                        />
                    </Button>
                    <Text fontSize="40px" fontWeight="bold" fontFamily="Inter">
                        Your investing
                    </Text>
                </Flex>
                <Text fontSize="64px" fontFamily="Inter" fontWeight="900">
                    {formatUSD(investmentTypeShare.conservativeAmount)}
                </Text>
                <Text
                    fontSize="24px"
                    fontWeight="bold"
                    fontFamily="Inter"
                    color="gray.300"
                >
                    to non-risky assets
                </Text>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Text fontSize="64px" fontFamily="Inter" fontWeight="900">
                    {formatUSD(investmentTypeShare.riskyAmount)}
                </Text>
                <Text
                    fontSize="24px"
                    fontWeight="bold"
                    fontFamily="Inter"
                    color="gray.300"
                >
                    to risky assets
                </Text>
            </Box>
            <Button
                mt={4}
                height="72px"
                minWidth="180px"
                backgroundColor="#FD92CA"
                color="black"
                borderRadius="16px"
                padding="16px 28px"
                fontSize="24px"
                fontWeight="bold"
                fontFamily="Inter"
                onClick={handleStartInvestment}
                disabled={!user?.id}
                _hover={{
                    backgroundColor: '#E67EB8',
                }}
                transition="all 0.2s ease-in-out"
            >
                <Text>
                    Invest{' '}
                    {formatUSD(
                        investmentTypeShare.riskyAmount +
                            investmentTypeShare.conservativeAmount
                    )}
                </Text>
            </Button>
            {/* Error handling */}
            {error && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                    Error: {defineIssue(error)}
                </Text>
            )}
            {/* Progress bar */}
            <Text fontSize="24px" fontWeight="bold" fontFamily="Inter">
                {currentStep}
            </Text>
            {/* <Text fontSize="24px" fontWeight="bold" fontFamily="Inter">
                {progress}
            </Text> */}

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
        </Flex>
    );
};
