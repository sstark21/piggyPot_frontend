import { useEffect, useState } from "react";
import {
  Container,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { InvestmentTypes } from "./investmentTypes";
import { InvestmentAmount } from "./investmentAmount";
import { InvestmentSummary } from "./investmentSummary";

export const InvestmentStepper = () => {
  const { user, authenticated, ready } = usePrivy();
  const [amountToInvest, setAmountToInvest] = useState<number>(0);
  const [investmentTypeShare, setInvestmentTypeShare] = useState<{
    risky: number;
    conservative: number;
    riskyAmount: number;
    conservativeAmount: number;
  }>({
    risky: 50,
    conservative: 50,
    riskyAmount: 0,
    conservativeAmount: 0,
  });

  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!authenticated && ready) {
      router.push("/");
    }
  }, [authenticated, ready, router]);

  const stepsMapper: Record<number, React.ReactNode> = {
    0: (
      <InvestmentAmount
        amount={amountToInvest}
        onAmountChange={setAmountToInvest}
      />
    ),
    1: (
      <InvestmentTypes
        amountToInvest={amountToInvest}
        shares={investmentTypeShare}
        onSharesChange={setInvestmentTypeShare}
      />
    ),
    2: (
      <InvestmentSummary
        amountToInvest={amountToInvest}
        investmentTypeShare={investmentTypeShare}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    ),
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return amountToInvest && amountToInvest > 0;
      case 1:
        return (
          investmentTypeShare.risky + investmentTypeShare.conservative === 100
        );
      case 2:
        return amountToInvest && amountToInvest > 0;
      case 3:
        return amountToInvest && amountToInvest > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack gap={8} alignItems="stretch">
        {/* Navigation Buttons */}
        {step < 3 && (
          <HStack justify="space-between" pt={6}>
            <Button
              onClick={handleBack}
              disabled={step === 0}
              variant="outline"
            >
              Back
            </Button>

            <HStack gap={4}>
              <Button onClick={handleClose} variant="ghost" colorScheme="red">
                Close
              </Button>

              {step < 2 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  colorScheme="blue"
                >
                  Next
                </Button>
              )}
            </HStack>
          </HStack>
        )}
        {/* Step Content */}
        <Flex minH="400px" align="center" justify="center">
          {stepsMapper[step]}
        </Flex>
      </VStack>
    </Container>
  );
};
