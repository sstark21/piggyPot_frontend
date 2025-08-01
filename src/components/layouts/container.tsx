import { Flex } from "@chakra-ui/react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      maxW="1500px"
      mx="auto"
      flexDirection="column"
      gap={4}
      alignItems="center"
      justifyContent="center"
      h="100vh"
    >
      {children}
    </Flex>
  );
};
