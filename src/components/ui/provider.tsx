'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { PrivyProvider } from '@privy-io/react-auth';

export function Provider(props: { children: React.ReactNode }) {
      const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

      if (!privyAppId) {
          console.error('NEXT_PUBLIC_PRIVY_APP_ID is not defined');
          return <div>Error: Privy App ID not configured</div>;
      }
    return (
        <ChakraProvider value={defaultSystem}>
                {props.children}
        </ChakraProvider>
    );
}
