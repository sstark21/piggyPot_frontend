"use client";

import { Container, Flex, Text } from "@chakra-ui/react";
import { InvestmentInfoLayout } from "@/components/layouts/dashboard/investmentInfo";
import { useUserContext } from "@/components/providers/userProvider";

export default function DashboardPage() {
  const { authenticated, ready } = useUserContext();

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
    <Container maxW="1500px" mx="auto">
      <InvestmentInfoLayout />
    </Container>
  );
}
