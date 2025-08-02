import { Button, Flex, Input, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { formatUSD } from '@/libs/index';
import { useUserContext } from '@/components/providers/userProvider';

export const InvestmentAmount = ({
    amount,
    onAmountChange,
    setIsAmountExceeded,
    onNext,
}: {
    amount: number | null;
    onAmountChange: (amount: number) => void;
    setIsAmountExceeded: (isExceeded: boolean) => void;
    onNext: () => void;
}) => {
    const { balanceUSD, isBalanceLoading } = useUserContext();
    const [inputValue, setInputValue] = useState<string>('');

    const handleInputChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');

        const parsedValue = digitsOnly === '' ? 0 : Number(digitsOnly) || 0;
        if (balanceUSD && parsedValue > balanceUSD * 100) {
            return;
        }
        setInputValue(digitsOnly);

        onAmountChange(parsedValue);

        if (balanceUSD) {
            setIsAmountExceeded(parsedValue > balanceUSD);
        }
    };

    const formatSimpleUSD = (amount: number): string => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    return (
        <Flex
            textAlign="center"
            gap={4}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Text fontSize="24px" fontWeight="bold" fontFamily="Inter">
                How much do you want to invest?
            </Text>
            <Input
                height="100px"
                placeholder="$0"
                disabled={isBalanceLoading}
                value={formatSimpleUSD(parseInt(inputValue) || 0)}
                onChange={e => handleInputChange(e.target.value)}
                border="none"
                borderRadius="16px"
                backgroundColor="transparent"
                padding="16px 24px"
                fontSize="82px"
                fontWeight="bold"
                fontFamily="Inter"
                textAlign="center"
                _placeholder={{
                    color: 'gray.400',
                    fontSize: '82px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter',
                }}
                _focus={{
                    border: 'none',
                    outline: 'none',
                }}
            />
            <Text fontSize="16px" color="gray.200" fontFamily="Inter">
                {isBalanceLoading
                    ? 'Loading...'
                    : `${formatUSD(balanceUSD || 0)} available`}
            </Text>
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
                disabled={!inputValue}
                onClick={onNext}
            >
                <Text>Continue</Text>
            </Button>
        </Flex>
    );
};
