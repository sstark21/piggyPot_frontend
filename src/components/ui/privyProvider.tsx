"use client";

import { appConfig } from "@/config";
import { PrivyProvider } from "@privy-io/react-auth";

export function PrivyProviderComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we have the required configuration
  if (!appConfig.privy.appId) {
    console.error(
      "PRIVY_APP_ID is not set. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables."
    );
    return <div>Configuration error: PRIVY_APP_ID not set</div>;
  }

  return (
    <PrivyProvider
      appId={appConfig.privy.appId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
