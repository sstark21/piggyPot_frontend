import { Box, Text, VStack, HStack, Input } from "@chakra-ui/react";

export const InvestmentTypes = ({
  amountToInvest,
  shares,
  onSharesChange,
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
}) => {
  const handleSliderChange = (value: number) => {
    const riskyPercentage = value;
    const conservativePercentage = 100 - value;

    const riskyAmount = amountToInvest
      ? (amountToInvest * riskyPercentage) / 100
      : 0;
    const conservativeAmount = amountToInvest
      ? (amountToInvest * conservativePercentage) / 100
      : 0;

    onSharesChange({
      risky: riskyPercentage,
      conservative: conservativePercentage,
      riskyAmount,
      conservativeAmount,
    });
  };

  return (
    <VStack gap={6} alignItems="center" w="full">
      <Text fontSize="xl" fontWeight="bold">
        Asset Allocation
      </Text>

      <Box w="full" px={4}>
        <Text mb={4} textAlign="center">
          Risky vs Conservative Allocation
        </Text>

        <Input
          type="range"
          value={shares.risky}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          min={0}
          max={100}
          step={5}
          w="full"
        />

        <HStack justify="space-between" mt={4}>
          <VStack alignItems="center">
            <Text fontWeight="bold" color="red.500">
              Risky
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {shares.risky}%
            </Text>
            <Text fontSize="sm" color="gray.600">
              ${shares.riskyAmount.toFixed(2)}
            </Text>
          </VStack>

          <VStack alignItems="center">
            <Text fontWeight="bold" color="green.500">
              Conservative
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {shares.conservative}%
            </Text>
            <Text fontSize="sm" color="gray.600">
              ${shares.conservativeAmount.toFixed(2)}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </VStack>
  );
};
