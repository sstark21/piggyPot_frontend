'use client';

import styles from "./page.module.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingComponent } from "@/components/ui/loading";

export default function Home() {
  const { login, ready, authenticated, user } = usePrivy();
  const wallets = useWallets();
  const router = useRouter();

  console.log("wallets:", wallets);
  console.log("user:", user);

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <Flex>
        <LoadingComponent />
      </Flex>
    );
  }

  return (
    <div className={styles.page}>
      <Text>Welcome to the app</Text>
      <Button onClick={() => login()}>Login to account</Button>
    </div>
  );
}
