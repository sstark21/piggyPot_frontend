import { Input, Text } from '@chakra-ui/react';
import { useBalance } from '@/hooks/useBalance';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const InvestmentAmount = ({
    amount,
    onAmountChange,
    setIsAmountExceeded,
}: {
    amount: number | null;
    onAmountChange: (amount: number) => void;
    setIsAmountExceeded: (isExceeded: boolean) => void;
}) => {
    const { user } = usePrivy();
    const { balanceUSD, isLoading, fetchBalance } = useBalance();
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if (user?.wallet?.address) {
            fetchBalance(user.wallet.address);
        }
    }, [fetchBalance, user?.wallet?.address]);

    const handleInputChange = (value: string) => {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInputValue(value);
            const parsedValue = value === '' ? 0 : parseFloat(value) || 0;
            onAmountChange(parsedValue);

            if (balanceUSD) {
                setIsAmountExceeded(parsedValue > balanceUSD);
            }
        }
    };

    return (
        <>
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Investment Amount
                <Text fontSize="sm" color="gray.500">
                    Current balance:{' '}
                    {isLoading ? 'Loading...' : `${balanceUSD} USD`}
                </Text>
                <Input
                    placeholder="0"
                    disabled={isLoading}
                    value={inputValue}
                    onChange={e => handleInputChange(e.target.value)}
                />
            </Text>
        </>
    );
};
