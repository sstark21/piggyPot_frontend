import { Button, Text, VStack } from "@chakra-ui/react";

export const InvestmentProcessing = ({
  amount,
  shares,
  isProcessing,
  setIsProcessing,
}: {
  amount: number | null;
  shares: { risky: number; conservative: number };
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}) => {
  const handleStartInvestment = async () => {
    setIsProcessing(true);
    // TODO: Implement actual investment logic here
    // This is where you would call your swap/approval hooks

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Handle success/failure
    }, 3000);
  };

  return (
    <VStack gap={6} alignItems="center">
      <Text fontSize="lg" textAlign="center">
        Ready to invest ${amount} with {shares.risky}% risky and{" "}
        {shares.conservative}% conservative allocation?
      </Text>

      {!isProcessing ? (
        <Button onClick={handleStartInvestment} colorScheme="green" size="lg">
          Start Investment
        </Button>
      ) : (
        <VStack gap={4}>
          <Text>Processing your investment...</Text>
          {/* Add a spinner or progress indicator here */}
        </VStack>
      )}
    </VStack>
  );
};
