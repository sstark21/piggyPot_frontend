import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Provider } from '@/components/providers/chakraProvider';
import Header from '@/components/ui/header';

import { PrivyProviderComponent } from '@/components/providers/privyProvider';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Piggy Pot 2',
    description: 'Piggy Pot 3',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable}`}>
                <Provider>
                    <PrivyProviderComponent>
                        <Header />
                        {children}
                    </PrivyProviderComponent>
                </Provider>
            </body>
        </html>
    );
}
