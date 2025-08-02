import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ChakraCustomProvider } from '@/components/providers/chakraProvider';
import Header from '@/components/ui/header';
import { UserProvider } from '@/components/providers/userProvider';
import { PrivyProviderComponent } from '@/components/providers/privyProvider';
import { QueryProvider } from '@/components/providers/queryProvider';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Piggy Pot',
    description: 'Piggy Pot',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable}`}>
                <ChakraCustomProvider>
                    <PrivyProviderComponent>
                        <UserProvider>
                            <QueryProvider>
                                <Header />
                                {children}
                            </QueryProvider>
                        </UserProvider>
                    </PrivyProviderComponent>
                </ChakraCustomProvider>
            </body>
        </html>
    );
}
