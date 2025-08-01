import { base } from "viem/chains";

const ONE_INCH_API_KEY =
  process.env.NEXT_PUBLIC_ONE_INCH_API_KEY || process.env.ONE_INCH_API_KEY;

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL;

if (!ONE_INCH_API_KEY || !RPC_URL) {
  throw new Error("ONE_INCH_API_KEY or RPC_URL is not set");
}

export const baseUrl = `https://api.1inch.dev/swap/v6.1/${base.id}`;
export const apiKey = ONE_INCH_API_KEY;
export const rpcUrl = RPC_URL;
