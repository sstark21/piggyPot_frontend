'use client';

import { Box, Button, Flex, Image, IconButton, Text } from '@chakra-ui/react';
import { PiUserBold } from 'react-icons/pi';
import { useUser } from '@/hooks/useUser';
import { formatUSD } from '@/libs';

const Header = () => {
    const { user } = useUser();

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
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Image
                        src="/images/piggy_pot_logo.svg"
                        height="40px"
                        objectFit="contain"
                        marginRight="15px"
                    />
                    <Image
                        src="/images/piggy_pot_title.svg"
                        height="30px"
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
                    <Text
                        fontSize="20px"
                        fontWeight="bold"
                        fontFamily="Inter"
                        px="12px"
                    >
                        {formatUSD(user?.balance.balanceUSD || 0)}
                    </Text>

                    <Button
                        borderRadius="12px"
                        size="md"
                        backgroundColor="white"
                        color="black"
                        marginRight="10px"
                    >
                        <Text
                            fontSize="14px"
                            fontWeight="bold"
                            fontFamily="Inter"
                            px="12px"
                        >
                            Top Up
                        </Text>
                    </Button>
                    <IconButton
                        aria-label="User profile"
                        size="md"
                        variant="subtle"
                        borderRadius="12px"
                        backgroundColor="#FCFCFC33"
                        color="white"
                    >
                        <PiUserBold />
                    </IconButton>
                </Box>
            </Flex>
        </Box>
    );
};

export default Header;
