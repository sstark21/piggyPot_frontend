"use client";

import styles from "./page.module.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@chakra-ui/react";

export default function Home() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const wallets = useWallets();

  console.log("wallets:", wallets);

  console.log("user:", user);

  console.log("authenticated:", authenticated);

  console.log("ready:", ready);

  return (
    <div className={styles.page}>
      {user?.wallet?.address?.toString() || "No wallet connected"}
      <Button onClick={() => login()}>Connect Wallet</Button>;
    </div>
  );
}
