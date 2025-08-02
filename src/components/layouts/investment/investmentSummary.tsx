import { VStack, HStack, Text, Box, Button, Flex } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { InvestmentWorkflow } from './investmentWorkflow';
import { defineIssue } from '@/utils/issuesProcessing';
import { formatUSD } from '@/libs';

const MOCK_DATA = {
    risky: {
        name: 'Risky',
        amount: 10,
        percentage: 50,
    },
    conservative: {
        name: 'Conservative',
        amount: 10,
        percentage: 50,
    },
};

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
    return (
        <Flex
            gap={4}
            alignItems="center"
            w="full"
            maxW="600px"
            flexDirection="column"
            justifyContent="center"
        >
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Text fontSize="64px" fontFamily="Inter" fontWeight="900">
                    {formatUSD(MOCK_DATA.conservative.amount)}
                </Text>
                <Text
                    fontSize="24px"
                    fontWeight="bold"
                    fontFamily="Inter"
                    color="gray.300"
                >
                    Non-risky assets
                </Text>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Text fontSize="64px" fontFamily="Inter" fontWeight="900">
                    {formatUSD(MOCK_DATA.risky.amount)}
                </Text>
                <Text
                    fontSize="24px"
                    fontWeight="bold"
                    fontFamily="Inter"
                    color="gray.300"
                >
                    {MOCK_DATA.risky.percentage}%
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
            >
                <Text>Invest {formatUSD(MOCK_DATA.risky.amount + MOCK_DATA.conservative.amount)}</Text>
            </Button>
        </Flex>
    );
};
