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
    const { balanceUSD, isBalanceLoading, ready } = useUserContext();
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if (amount && amount > 0) {
            setInputValue(amount.toString());
        }
    }, [amount]);

    const handleInputChange = (value: string) => {
        // Remove dollar sign and any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, '');

        // Ensure only one decimal point
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            return; // More than one decimal point, ignore
        }

        // Limit decimal places to 2
        if (parts.length === 2 && parts[1].length > 2) {
            return; // Too many decimal places, ignore
        }

        // Allow empty string or valid number format
        if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
            setInputValue(cleanValue);
            const parsedValue =
                cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
            onAmountChange(parsedValue);

            if (balanceUSD) {
                setIsAmountExceeded(parsedValue > balanceUSD);
            }
        }
    };

    // const formatDisplayValue = (value: string): string => {
    //     if (!value || value === '0') {
    //         return '$0';
    //     }

    //     const numValue = parseFloat(value);
    //     if (isNaN(numValue)) {
    //         return '$0';
    //     }

    //     return `$${numValue.toFixed(2)}`;
    // };

    console.log('ready: ', ready);
    console.log('isBalanceLoading: ', isBalanceLoading);

    return (
        <Flex
            textAlign="center"
            gap={4}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mt={100}
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
                disabled={isBalanceLoading || !ready}
                value={inputValue ? `$${inputValue}` : ''}
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
                _hover={{
                    backgroundColor: '#E67EB8',
                }}
                transition="all 0.2s ease-in-out"
            >
                <Text>Continue</Text>
            </Button>
        </Flex>
    );
};
