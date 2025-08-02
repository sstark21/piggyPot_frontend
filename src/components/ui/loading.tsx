'use client';

import { Box, Flex } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Image from 'next/image';

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

export const LoadingComponent = () => {
    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={6}
            mt={200}
        >
            <Box
                animation={`${bounce} 2s infinite`}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Image
                    src="/images/piggy_pot_logo.svg"
                    alt="Piggy Pot"
                    width={60}
                    height={60}
                    style={{
                        filter: 'drop-shadow(0 0 20px rgba(253, 146, 202, 0.5))',
                    }}
                />
            </Box>
        </Flex>
    );
};
