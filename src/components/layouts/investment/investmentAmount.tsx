import { Input, Text } from "@chakra-ui/react";

export const InvestmentAmount = ({
  amount,
  onAmountChange,
}: {
  amount: number | null;
  onAmountChange: (amount: number) => void;
}) => {
  return (
    <Text fontSize="2xl" fontWeight="bold" textAlign="center">
      Investment Amount
      <Input
        type="text"
        placeholder="0"
        value={amount || ""}
        onChange={(e) => onAmountChange(Number(e.target.value))}
      />
    </Text>
  );
};
