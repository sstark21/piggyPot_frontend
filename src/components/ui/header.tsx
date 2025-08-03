'use client';

import { Box, Button, Flex, Image, IconButton, Text } from '@chakra-ui/react';
import { PiUserBold } from 'react-icons/pi';
import { formatUSD } from '@/libs/index';
import { useUserContext } from '@/components/providers/userProvider';
import { useRouter } from 'next/navigation';

const Header = () => {
    const {
        balanceUSD,
        isBalanceLoading,
        logout,
        ready,
        authenticated,
        login,
    } = useUserContext();
    const router = useRouter();
    return (
        <Box
            as="header"
            bg="transparent"
            borderBottom="1px"
            borderColor="gray.200"
            px={4}
            py={3}
            position="sticky"
            top={0}
            zIndex={10}
        >
            <Flex
                justify="space-between"
                align="center"
                maxW="1500px"
                mx="auto"
            >
                <Box flex="1"></Box>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => router.push('/dashboard')}
                >
                    <Image
                        src="/images/piggy_pot_logo.svg"
                        height="40px"
                        alt="Piggy Pot Logo"
                        objectFit="contain"
                        marginRight="15px"
                    />
                    <Image
                        src="/images/piggy_pot_title.svg"
                        height="30px"
                        alt="Piggy Pot Title"
                        objectFit="contain"
                        marginLeft="15px"
                    />
                </Box>
                <Box
                    flex="1"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {ready && !authenticated && (
                        <Button
                            borderRadius="12px"
                            size="md"
                            backgroundColor="white"
                            color="black"
                            marginRight="10px"
                            onClick={() => login()}
                            fontSize="14px"
                            fontWeight="bold"
                            fontFamily="Inter"
                            px="12px"
                        >
                            Login
                        </Button>
                    )}

                    {ready && authenticated && (
                        <>
                            {isBalanceLoading ? (
                                <Text>Loading balance...</Text>
                            ) : (
                                <Text
                                    fontSize="20px"
                                    fontWeight="bold"
                                    fontFamily="Inter"
                                    px="12px"
                                >
                                    {formatUSD(balanceUSD || 0)}
                                </Text>
                            )}
                            {/* <IconButton
                                aria-label="User profile"
                                size="md"
                                variant="subtle"
                                borderRadius="12px"
                                backgroundColor="#FCFCFC33"
                                color="white"
                                onClick={() => router.push('/dashboard')}
                            >
                                <PiUserBold />
                            </IconButton> */}
                            <Button
                                borderRadius="12px"
                                size="md"
                                backgroundColor="white"
                                color="black"
                                marginRight="10px"
                                onClick={() => logout()}
                                fontSize="14px"
                                fontWeight="bold"
                                fontFamily="Inter"
                                px="12px"
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </Box>
            </Flex>
        </Box>
    );
};

export default Header;
