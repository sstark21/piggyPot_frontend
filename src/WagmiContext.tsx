import type { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config.ts';

const queryClient = new QueryClient();

export default function AppKitProvider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
