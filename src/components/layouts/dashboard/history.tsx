import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { useOperations } from '@/hooks/useOperations';
import { useEffect } from 'react';
import { useUserContext } from '@/components/providers/userProvider';
import { Operation } from '@/types/backend/operations';

interface HistoryItemProps {
    operation: Operation;
}

const HistoryItem = ({ operation }: HistoryItemProps) => {
    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format amount
    const formatAmount = (amount: number) => {
        return `$${amount.toFixed(2)}`;
    };

    // Get status description
    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'RECOMMENDATION_INIT':
                return 'Investment initiated';
            case 'RECOMMENDATION_COMPLETED':
                return 'Investment completed';
            case 'RECOMMENDATION_FAILED':
                return 'Investment failed';
            default:
                return 'Investment in progress';
        }
    };

    return (
        <Box
            w="full"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="12px"
            p={4}
            border="1px solid rgba(255, 255, 255, 0.1)"
        >
            <Flex justify="space-between" align="flex-start">
                <VStack align="start" gap={1} flex={1}>
                    <Text fontSize="sm" color="gray.200" fontFamily="Inter">
                        {formatDate(operation.operationDate)}
                    </Text>
                    <Text fontSize="md" color="white" fontFamily="Inter">
                        {getStatusDescription(operation.status)}
                    </Text>
                </VStack>

                <Flex align="center" gap={2}>
                    <VStack align="end" gap={1}>
                        <Text fontSize="sm" color="gray.200" fontFamily="Inter">
                            Amount
                        </Text>
                        <Text
                            fontSize="md"
                            fontWeight="bold"
                            color="white"
                            fontFamily="Inter"
                        >
                            {formatAmount(operation.investedAmount)}
                        </Text>
                        {operation.profit !== 0 && (
                            <Text
                                fontSize="xs"
                                color={
                                    operation.profit > 0
                                        ? 'green.300'
                                        : 'red.300'
                                }
                                fontFamily="Inter"
                            >
                                {operation.profit > 0 ? '+' : ''}
                                {formatAmount(operation.profit)} profit
                            </Text>
                        )}
                    </VStack>
                </Flex>
            </Flex>
        </Box>
    );
};

const HistoryList = ({ operations }: { operations: Operation[] }) => {
    if (!operations || operations.length === 0) {
        return <HistoryEmpty />;
    }

    return (
        <VStack gap={4} w="full">
            {operations.map((operation, index) => (
                <HistoryItem
                    key={operation.operationId}
                    operation={operation}
                />
            ))}
        </VStack>
    );
};

const HistoryEmpty = () => {
    return (
        <Box
            w="full"
            bg="rgba(255, 255, 255, 0.1)"
            borderRadius="12px"
            p={8}
            border="1px solid rgba(255, 255, 255, 0.1)"
            textAlign="center"
        >
            <VStack gap={2}>
                <Text
                    fontSize="lg"
                    color="gray.300"
                    fontFamily="Inter"
                    fontWeight="medium"
                >
                    No investment history yet
                </Text>
                <Text fontSize="sm" color="gray.400" fontFamily="Inter">
                    Your investment history will appear here once you make your
                    first investment.
                </Text>
            </VStack>
        </Box>
    );
};

export const HistoryLayout = () => {
    const { user, ready } = useUserContext();
    const { fetchOperations, operations, isLoading, error } = useOperations();

    useEffect(() => {
        if (user?.wallet?.address) {
            fetchOperations(user.id);
        }
    }, [user?.wallet?.address, ready]);

    console.log('operations', operations);
    console.log('isLoading', isLoading);

    if (isLoading) {
        return (
            <Box
                w="full"
                bg="rgba(255, 255, 255, 0.1)"
                borderRadius="12px"
                p={8}
                border="1px solid rgba(255, 255, 255, 0.1)"
                textAlign="center"
            >
                <Text fontSize="lg" color="gray.300" fontFamily="Inter">
                    Loading history...
                </Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                w="full"
                bg="rgba(255, 255, 255, 0.1)"
                borderRadius="12px"
                p={8}
                border="1px solid rgba(255, 255, 255, 0.1)"
                textAlign="center"
            >
                <VStack gap={2}>
                    <Text
                        fontSize="lg"
                        color="red.300"
                        fontFamily="Inter"
                        fontWeight="medium"
                    >
                        Error loading history
                    </Text>
                    <Text fontSize="sm" color="gray.400" fontFamily="Inter">
                        {error}
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box w="full">
            <VStack gap={6} align="start" w="full">
                <HistoryList operations={operations} />
            </VStack>
        </Box>
    );
};
