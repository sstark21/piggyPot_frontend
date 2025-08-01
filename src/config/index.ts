import { baseUrl, apiKey, rpcUrl } from "./oneInch";
import { base } from "viem/chains";

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
}

export const appConfig = {
  chain: base,
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
  },
  oneInch: {
    baseUrl: baseUrl,
    apiKey: apiKey,
    rpcUrl: rpcUrl,
  },
};
