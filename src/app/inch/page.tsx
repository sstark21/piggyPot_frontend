"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useApprove } from "@/hooks/useApprove";
import { formatUnits } from "ethers";
import { useSwap } from "@/hooks/useSwap";

export default function InchPage() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const wallets = useWallets();

  const targetToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH
  const amountToSwap = "100000000000000"; // 0.0001 ETH (18 decimals)
  const destinationToken = "0x833589fCD6EDb6E08f4c7C32D4f71b54bDA02913";
  const expectedAllowance = "100000000000000";

  console.log("wallets:", wallets);

  console.log("user:", user);

  const {
    isLoading,
    allowance,
    isApproved,
    checkAllowance,
    approveIfNeeded,
    reset,
  } = useApprove();

  const {
    isLoading: isSwapLoading,
    txHash,
    swapTokens,
    reset: resetSwap,
  } = useSwap();

  console.log("allowance state:", {
    isLoading,
    allowance,
    isApproved,
  });

  const handleSwap = async () => {
    if (!user?.wallet) return;

    try {
      await swapTokens(
        targetToken,
        destinationToken,
        amountToSwap,
        user.wallet.address
      );
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };
  return (
    <Flex
      flexDirection="column"
      gap={4}
      alignItems="center"
      justifyContent="center"
      h="100vh"
    >
      {user?.wallet?.address?.toString() || "No wallet connected"}
      <Button
        w="200px"
        onClick={() => {
          authenticated ? logout() : login();
        }}
      >
        {authenticated ? "Disconnect Wallet" : "Connect Wallet"}
      </Button>
      <Flex flexDirection="column" gap={8}>
        <Flex flexDirection="column" gap={2}>
          {expectedAllowance && (
            <Text>
              Expected Allowance: {formatUnits(expectedAllowance, 18)}
            </Text>
          )}
        </Flex>

        {allowance && <Text>Allowance: {allowance}</Text>}
        {authenticated && user?.wallet?.address?.toString() && (
          <Button
            w="200px"
            onClick={() =>
              checkAllowance(
                targetToken,
                user?.wallet?.address?.toString() ?? "",
                BigInt(expectedAllowance)
              )
            }
          >
            Check Allowance
          </Button>
        )}
      </Flex>
      <Flex>
        {allowance && <Button onClick={() => handleSwap()}>Swap</Button>}
        {isSwapLoading ? (
          <Text>Swapping...</Text>
        ) : txHash ? (
          <Text>Hash: {txHash}</Text>
        ) : null}
      </Flex>
    </Flex>
  );
}
