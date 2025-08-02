import { Button, Flex, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { formatUSD } from '@/libs/index';
import { useUserContext } from '@/components/providers/userProvider';
import { IoIosArrowRoundBack } from 'react-icons/io';

export const InvestmentAmount = ({
    amount,
    onAmountChange,
    setIsAmountExceeded,
    onNext,
    onBack,
}: {
    amount: number | null;
    onAmountChange: (amount: number) => void;
    setIsAmountExceeded: (isExceeded: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const { balanceUSD, isBalanceLoading } = useUserContext();
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if (amount && amount > 0) {
            setInputValue((amount * 100).toString());
        }
    }, [amount]);

    const handleInputChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        const parsedValue = digitsOnly === '' ? 0 : Number(digitsOnly) || 0;

        if (balanceUSD && parsedValue > balanceUSD * 100) {
            return;
        }

        setInputValue(digitsOnly);
        onAmountChange(parsedValue / 100);

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
            h="100vh"
        >
            <Flex alignItems="center" gap={2} position="relative">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    color="white"
                    _hover={{ backgroundColor: 'transparent' }}
                    style={{
                        position: 'absolute',
                        left: '-70px',
                        top: '13px',
                    }}
                >
                    <IoIosArrowRoundBack
                        style={{
                            width: '60px',
                            height: '60px',
                        }}
                    />
                </Button>
                <Text fontSize="40px" fontWeight="bold" fontFamily="Inter">
                    How much do you want to invest?
                </Text>
            </Flex>
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
