import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/components/providers/userProvider';
import { formatUSD } from '@/libs/index';
import { IoWallet } from 'react-icons/io5';
import { FaHistory } from 'react-icons/fa';
import { LoadingComponent } from '@/components/ui/loading';
import { useEffect, useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';

const HISTORY_MOCK: { date: string; description: string; amount: number }[] = [
    {
        date: '2025-08-02 11:45',
        description: 'Investment',
        amount: 5,
    },
    {
        date: '2025-08-01 12:00',
        description: 'Investment',
        amount: 10,
    },
    {
        date: '2025-08-01 12:00',
        description: 'Investment',
        amount: 10,
    },
    {
        date: '2025-08-01 12:00',
        description: 'Investment',
        amount: 10,
    },
];

const TOTAL_INVESTMENT_MOCK = 0;
const PROFIT_VALUE_MOCK = 27.56;
const PROFIT_PERCENTAGE_MOCK = 2.44;

export const InvestmentInfoLayout = () => {
    const router = useRouter();

    const { authenticated, ready, balanceUSD, user } = useUserContext();
    const { uniswapValue, isLoading, error, fetchPortfolio } = usePortfolio();

    const [investedAmount, setInvestedAmount] = useState(0);

    useEffect(() => {
        if (user?.wallet?.address) {
            fetchPortfolio(user.wallet.address);
        }
    }, [user?.wallet?.address, ready]);

    useEffect(() => {
        console.log('uniswapValue:', uniswapValue);
        setInvestedAmount(uniswapValue || 0);
    }, [uniswapValue]);

    const investedAmountFormatted = formatUSD(investedAmount);
    const parts = investedAmountFormatted.split('.');

    if (!ready) {
        return (
            <Flex
                flexDirection="column"
                gap={4}
                alignItems="center"
                justifyContent="center"
                mt={100}
            >
                <LoadingComponent />
            </Flex>
        );
    }

    // Redirect if not authenticated
    if (!authenticated && ready) {
        return (
            <Flex
                flexDirection="column"
                gap={4}
                alignItems="center"
                justifyContent="center"
                h="100vh"
            >
                <Text>Redirecting to login...</Text>
            </Flex>
        );
    }
    return (
        <Flex
            flexDirection="column"
            gap={4}
            alignItems="center"
            mt={100}
            w="600px"
            mx="auto"
        >
            <Flex
                flexDirection="column"
                gap={2}
                alignItems="center"
                justifyContent="center"
            >
                <Text fontSize="40px" fontWeight="bold" fontFamily="Inter">
                    Total investment
                </Text>
                <Text fontSize="84px" fontWeight="900" fontFamily="Inter">
                    <Text as="span">{parts[0]}</Text>
                    {parts[1] && (
                        <Text as="span" color="gray.400">
                            .{parts[1]}
                        </Text>
                    )}
                </Text>
                {/* <Flex gap={2} alignItems="center">
                    <Text
                        fontSize="24px"
                        fontWeight="bold"
                        fontFamily="Inter"
                        color="#0BF050"
                    >
                        {'+' + formatUSD(PROFIT_VALUE_MOCK)}
                    </Text>
                    <Text
                        fontSize="30px"
                        fontWeight="bold"
                        fontFamily="Inter"
                        color="#0BF050"
                    >
                        ·
                    </Text>
                    <Text
                        fontSize="24px"
                        fontWeight="bold"
                        fontFamily="Inter"
                        color="#0BF050"
                    >
                        {PROFIT_PERCENTAGE_MOCK + '%'}
                    </Text>

                    <Text
                        fontSize="24px"
                        fontWeight="bold"
                        fontFamily="Inter"
                        color="gray.400"
                    >
                        last 24h
                    </Text>
                </Flex> */}
                <Button
                    height="72px"
                    width="180px"
                    backgroundColor="#FD92CA"
                    color="black"
                    borderRadius="16px"
                    padding="16px 28px"
                    fontSize="24px"
                    fontWeight="bold"
                    fontFamily="Inter"
                    disabled={!balanceUSD}
                    onClick={() => router.push('/invest')}
                    _hover={{
                        backgroundColor: '#E67EB8',
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease-in-out',
                    }}
                    _active={{
                        backgroundColor: '#D46A9C',
                        transform: 'scale(0.98)',
                    }}
                    transition="all 0.2s ease-in-out"
                >
                    <Flex alignItems="center" gap={2}>
                        <Text>Invest</Text>
                        <IoWallet style={{ width: '30px', height: '30px' }} />
                    </Flex>
                </Button>
            </Flex>
            <Box w="full">
                <Flex alignItems="center" gap={2} my={4}>
                    <FaHistory
                        style={{
                            width: '20px',
                            height: '20px',
                            color: 'lightgray',
                        }}
                    />
                    <Text fontSize="lg" color="lightgray" fontFamily="Inter">
                        History
                    </Text>
                </Flex>

                <Box
                    maxH="280px"
                    overflowY="auto"
                    css={{
                        '&::-webkit-scrollbar': {
                            width: '6px',
                            marginLeft: '10px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'rgba(255, 255, 255, 0.5)',
                        },
                    }}
                >
                    <VStack gap={3} w="full" pr={2}>
                        {HISTORY_MOCK.map((item, index) => (
                            <Box
                                key={index}
                                w="full"
                                bg="rgba(255, 255, 255, 0.2)"
                                borderRadius="12px"
                                p={4}
                                border="1px solid rgba(255, 255, 255, 0.1)"
                            >
                                <Flex
                                    justify="space-between"
                                    align="flex-start"
                                >
                                    <VStack align="start" gap={1} flex={1}>
                                        <Text
                                            fontSize="sm"
                                            color="gray.200"
                                            fontFamily="Inter"
                                        >
                                            {item.date}
                                        </Text>
                                        <Text
                                            fontSize="md"
                                            color="white"
                                            fontFamily="Inter"
                                        >
                                            {item.description}
                                        </Text>
                                    </VStack>

                                    <Flex align="center" gap={2}>
                                        <VStack align="end" gap={1}>
                                            <Text
                                                fontSize="sm"
                                                color="gray.200"
                                                fontFamily="Inter"
                                            >
                                                Amount
                                            </Text>
                                            <Text
                                                fontSize="md"
                                                fontWeight="bold"
                                                color="white"
                                                fontFamily="Inter"
                                            >
                                                {item.amount}
                                            </Text>
                                        </VStack>
                                    </Flex>
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </Box>
        </Flex>
    );
};
