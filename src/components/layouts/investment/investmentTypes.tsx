import { Box, Text, Flex, Slider, Button, Popover } from '@chakra-ui/react';
import { IoIosArrowRoundBack } from 'react-icons/io';

export const InvestmentTypes = ({
    amountToInvest,
    shares,
    onSharesChange,
    onNext,
    onBack,
}: {
    amountToInvest: number | null;
    shares: {
        risky: number;
        conservative: number;
        riskyAmount: number;
        conservativeAmount: number;
    };
    onSharesChange: (shares: {
        risky: number;
        conservative: number;
        riskyAmount: number;
        conservativeAmount: number;
    }) => void;
    onNext: () => void;
    onBack: () => void;
}) => {
    const handleSliderChange = ({ value }: { value: number[] }) => {
        console.log('handleSliderChange', value, amountToInvest);
        const riskyPct = Math.round(value[0] || 0);
        const conservativePct = 100 - riskyPct;

        const totalAmount = amountToInvest || 0;
        const riskyAmount = (totalAmount * riskyPct) / 100;
        const conservativeAmount = (totalAmount * conservativePct) / 100;

        onSharesChange({
            risky: riskyPct,
            conservative: conservativePct,
            riskyAmount: riskyAmount,
            conservativeAmount: conservativeAmount,
        });
    };
    return (
        <Flex
            gap={6}
            alignItems="center"
            w="full"
            flexDirection="column"
            justifyContent="center"
            maxW="600px"
            mt={100}
        >
            <Box
                w="full"
                px={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={4}
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
                    <Flex
                        flexDirection="column"
                        gap={2}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            fontSize="40px"
                            fontWeight="bold"
                            fontFamily="Inter"
                            textAlign="center"
                        >
                            How much you want to use for risky investments?
                        </Text>
                        <Text
                            fontSize="14px"
                            color="gray.400"
                            fontFamily="Inter"
                        >
                            Put 100% here for a test purpose
                        </Text>
                    </Flex>
                </Flex>

                <Slider.Root
                    value={[shares.risky]}
                    min={0}
                    max={100}
                    step={1}
                    w="full"
                    onValueChange={handleSliderChange}
                >
                    <Slider.Control>
                        <Slider.Track bg="gray.500" h="8px" borderRadius="4px">
                            <Slider.Range bg="#FD92CA" />
                        </Slider.Track>
                        <Slider.Thumb
                            index={0}
                            boxSize={6}
                            bg="white"
                            border="2px"
                            borderColor="#FD92CA"
                            _focus={{
                                boxShadow: '0 0 0 3px rgba(253, 146, 202, 0.3)',
                            }}
                        />
                    </Slider.Control>
                </Slider.Root>

                <Text
                    textAlign="center"
                    mt={4}
                    fontSize="lg"
                    fontWeight="bold"
                    fontFamily="Inter"
                >
                    <Text as="span" color="white">
                        {Math.round(shares.risky)}%
                    </Text>
                    <Text as="span" color="gray.400" ml={2}>
                        ${shares.riskyAmount.toFixed(2)}
                    </Text>
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
                    onClick={onNext}
                    _hover={{
                        backgroundColor: '#E67EB8',
                    }}
                    transition="all 0.2s ease-in-out"
                >
                    <Text>Continue</Text>
                </Button>

                <Popover.Root>
                    <Popover.Trigger>
                        <Box
                            as="span"
                            fontSize="20px"
                            color="gray.400"
                            cursor="help"
                            fontFamily="Inter"
                            _hover={{ color: 'gray.200' }}
                            textDecoration="underline"
                            mt={4}
                        >
                            What means risky investments?
                        </Box>
                    </Popover.Trigger>
                    <Popover.Positioner>
                        <Popover.Content
                            bg="gray.800"
                            border="none"
                            borderRadius="16px"
                            p={4}
                        >
                            <Popover.Body>
                                <Text
                                    fontSize="14px"
                                    color="gray.300"
                                    fontFamily="Inter"
                                    lineHeight="1.6"
                                >
                                    Risky assets are investment opportunities
                                    with the potential for exceptional returns —
                                    but also with a heightened risk of
                                    volatility and capital loss. On our
                                    platform, these typically involve swap-based
                                    strategies with unstable liquidity, sudden
                                    market shifts, or limited historical data.
                                    <br />
                                    <br />
                                    What sets us apart: the classification of an
                                    asset as high-yield and high-risk is not
                                    manual — it is the result of real-time
                                    analysis by an on-chain agent that processes
                                    a large set of metrics and data points. The
                                    agent continuously monitors market
                                    conditions, swap parameters, and internal
                                    risk indicators to make data-driven
                                    decisions.
                                </Text>
                            </Popover.Body>
                        </Popover.Content>
                    </Popover.Positioner>
                </Popover.Root>
            </Box>
        </Flex>
    );
};
