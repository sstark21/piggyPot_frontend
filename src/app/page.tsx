'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingComponent } from '@/components/ui/loading';

export default function Home() {
    const { login, ready, authenticated, user } = usePrivy();
    const wallets = useWallets();
    const router = useRouter();

    console.log('wallets:', wallets);
    console.log('user:', user);

    useEffect(() => {
        if (ready && authenticated) {
            router.push('/dashboard');
        }
    }, [ready, authenticated, router]);

    if (!ready) {
        return (
            <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={100}
            >
                <LoadingComponent />
            </Flex>
        );
    }

    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={100}
            gap={40}
        >
            <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={20}
                mt={100}
            >
                <Heading fontSize="40px" fontWeight="bold" fontFamily="Inter">
                    Welcome to the app
                </Heading>
                <Flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={5}
                    textAlign="center"
                    maxW="600px"
                >
                    <Text
                        fontSize="20px"
                        fontWeight="semibold"
                        fontFamily="Inter"
                    >
                        For testing purpose, please use the following
                        credentials to login. You would have small USDC on your
                        balance that you can use to invest using PiggyPot
                    </Text>
                    <Text fontSize="20px" fontWeight="bold" fontFamily="Inter">
                        Email: test-6163@privy.io
                    </Text>
                    <Text fontSize="20px" fontWeight="bold" fontFamily="Inter">
                        OTP: 705245
                    </Text>
                </Flex>
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
                disabled={!ready}
                onClick={() => login()}
            >
                <Flex alignItems="center" gap={2}>
                    <Text>Login</Text>
                </Flex>
            </Button>
        </Flex>
    );
}
