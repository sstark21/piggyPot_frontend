import { VStack, HStack, Text, Box } from "@chakra-ui/react";

export const InvestmentSummary = ({
  amountToInvest,
  investmentTypeShare,
}: {
  amountToInvest: number | null;
  investmentTypeShare: {
    risky: number;
    conservative: number;
    riskyAmount: number;
    conservativeAmount: number;
  };
}) => {
  if (!amountToInvest) {
    return (
      <VStack gap={4} alignItems="center">
        <Text fontSize="lg" color="gray.500">
          No investment amount specified
        </Text>
      </VStack>
    );
  }

  return (
    <VStack gap={6} alignItems="center" w="full">
      <Text fontSize="2xl" fontWeight="bold">
        Investment Summary
      </Text>

      <Box
        w="full"
        p={6}
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        bg="gray.50"
      >
        <VStack gap={4} alignItems="stretch">
          {/* Total Investment Amount */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Total Investment Amount
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.600">
              ${amountToInvest.toFixed(2)}
            </Text>
          </Box>

          <Box h="1px" bg="gray.200" />

          {/* Asset Allocation Summary */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Asset Allocation
            </Text>

            <VStack gap={3} alignItems="stretch">
              {/* Risky Assets */}
              <HStack
                justify="space-between"
                p={3}
                bg="red.50"
                borderRadius="md"
              >
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="red.600">
                    Risky Assets
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Higher potential returns, higher risk
                  </Text>
                </VStack>
                <VStack alignItems="end" gap={1}>
                  <Text fontSize="xl" fontWeight="bold" color="red.600">
                    {investmentTypeShare.risky}%
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    ${investmentTypeShare.riskyAmount.toFixed(2)}
                  </Text>
                </VStack>
              </HStack>

              {/* Conservative Assets */}
              <HStack
                justify="space-between"
                p={3}
                bg="green.50"
                borderRadius="md"
              >
                <VStack alignItems="start" gap={1}>
                  <Text fontWeight="bold" color="green.600">
                    Conservative Assets
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Lower risk, stable returns
                  </Text>
                </VStack>
                <VStack alignItems="end" gap={1}>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    {investmentTypeShare.conservative}%
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    ${investmentTypeShare.conservativeAmount.toFixed(2)}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          <Box h="1px" bg="gray.200" />
        </VStack>
      </Box>
    </VStack>
  );
};
