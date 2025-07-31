"use client";

import { appConfig } from "@/config";
import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";

export function PrivyProviderComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={appConfig.privy.appId}
      clientId={appConfig.privy.clientId} // <--- to avoid cors issues on localhost
      config={{
        defaultChain: appConfig.chain,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [base],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
