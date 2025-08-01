import { Flex } from "@chakra-ui/react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
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
