import { Button, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/components/providers/userProvider';
import { formatUSD } from '@/libs/index';
import { IoWallet } from 'react-icons/io5';

const TOTAL_INVESTMENT_MOCK = 1127.56;
const PROFIT_VALUE_MOCK = 27.56;
const PROFIT_PERCENTAGE_MOCK = 2.44;

export const InvestmentInfoLayout = () => {
    const router = useRouter();

    const { authenticated, ready, balanceUSD } = useUserContext();
    const formatted = formatUSD(TOTAL_INVESTMENT_MOCK);
    const parts = formatted.split('.');
    if (!ready) {
        return (
            <Flex
                flexDirection="column"
                gap={4}
                alignItems="center"
                justifyContent="center"
                h="100vh"
            >
                <Text>Loading...</Text>
            </Flex>
        );
    }

    // Redirect if not authenticated
    if (!authenticated) {
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
            justifyContent="center"
            h="100vh"
        >
            <Text fontSize="24px" fontWeight="bold" fontFamily="Inter">
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
            <Flex gap={2} alignItems="center">
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
            </Flex>
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
            >
                <Flex alignItems="center" gap={2}>
                    <Text>Invest</Text>
                    <IoWallet style={{ width: '30px', height: '30px' }} />
                </Flex>
            </Button>
        </Flex>
    );
};
