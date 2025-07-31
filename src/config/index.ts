import { baseUrl, apiKey, rpcUrl } from "./oneInch";

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
}

export const appConfig = {
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  },
  oneInch: {
    baseUrl: baseUrl,
    apiKey: apiKey,
    rpcUrl: rpcUrl,
  },
};
