import { Box, Text, Flex, Slider, Button } from '@chakra-ui/react';

export const InvestmentTypes = ({
    amountToInvest,
    shares,
    onSharesChange,
    onNext,
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
}) => {
    return (
        <Flex
            gap={6}
            alignItems="center"
            w="full"
            flexDirection="column"
            justifyContent="center"
            maxW="600px"
        >
            <Box
                w="full"
                px={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={4}
            >
                <Text
                    mb={4}
                    textAlign="center"
                    fontSize="40px"
                    fontWeight="bold"
                    fontFamily="Inter"
                >
                    How much you want to use for risky investments?
                </Text>

                <Slider.Root
                    value={[shares.risky]}
                    min={0}
                    max={100}
                    step={1}
                    w="full"
                    onValueChange={({ value }) => {
                        const riskyPct = Math.round(value[0] || 0);
                        const conservativePct = 100 - riskyPct;
                        onSharesChange({
                            risky: riskyPct,
                            conservative: conservativePct,
                            riskyAmount:
                                ((amountToInvest || 0) * riskyPct) / 100,
                            conservativeAmount:
                                ((amountToInvest || 0) * conservativePct) / 100,
                        });
                    }}
                >
                    <Slider.Control>
                        <Slider.Track bg="gray.700" h="8px" borderRadius="4px">
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
                >
                    <Text>Continue</Text>
                </Button>
            </Box>
        </Flex>
    );
};
