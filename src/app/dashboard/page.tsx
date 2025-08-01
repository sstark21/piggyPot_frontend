"use client";
import { usePrivy, Wallet } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, Text } from "@chakra-ui/react";
import { useBalance } from "@/hooks/useBalance";

export default function DashboardPage() {
  const { user, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const {
    fetchBalance,
    balanceUSD,
    isLoading: isBalanceLoading,
  } = useBalance();

  useEffect(() => {
    console.log("Auth state:", { authenticated, ready, user: !!user });

    if (!authenticated && ready) {
      console.log("Redirecting to home page...");
      router.push("/");
      return;
    }

    if (user?.wallet) {
      setWallet(user.wallet);
    }
  }, [user, router, authenticated, ready]);

  useEffect(() => {
    if (wallet) {
      fetchBalance(wallet.address);
    }
  }, [wallet, fetchBalance]);

  console.log("user:", user);

  // Show loading while checking authentication
  if (!ready) {
    return (
      <Flex
        flexDirection="column"
        gap={4}
        alignItems="center"
        justifyContent="center"
        h="100vh"
      >
        <Text>Loading...</Text>
      </Flex>
    );
  }

  // Redirect if not authenticated
  if (!authenticated) {
    return (
      <Flex
        flexDirection="column"
        gap={4}
        alignItems="center"
        justifyContent="center"
        h="100vh"
      >
        <Text>Redirecting to login...</Text>
      </Flex>
    );
  }

  return (
    <Flex
      flexDirection="column"
      gap={4}
      alignItems="center"
      justifyContent="center"
      h="100vh"
    >
      <Text>Dashboard</Text>
      {user ? (
        <Text>Wallet: {wallet?.address}</Text>
      ) : (
        <Text>Loading profile...</Text>
      )}
      {isBalanceLoading ? (
        <Text>Loading balance...</Text>
      ) : (
        <Text>Balance in USD: {balanceUSD}</Text>
      )}
    </Flex>
  );
}
