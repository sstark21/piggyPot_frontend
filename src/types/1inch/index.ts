import { type Hex } from "viem";

export type AllowanceResponse = { allowance: string };
export type TransactionPayload = { to: Hex; data: Hex; value: bigint };
export type TxResponse = { tx: TransactionPayload };
export type ApproveTransactionResponse = {
  to: Hex;
  data: Hex;
  value: bigint;
  gas?: string;
};
