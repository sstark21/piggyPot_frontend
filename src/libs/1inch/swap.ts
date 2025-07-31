import { call1inchAPI } from "./callApi";
import { TxResponse } from "@/types/1inch";
// import { signAndSendTransaction } from "./sendTransaction";

export async function swapTokens(
  walletAddress: string,
  targetToken: string,
  destinationToken: string,
  amount: string
): Promise<void> {
  const swapParams = {
    src: targetToken,
    dst: destinationToken,
    amount: amount,
    from: walletAddress,
    slippage: "1",
    disableEstimate: "false",
    allowPartialFill: "false",
  };

  //   console.log("Fetching swap transaction...");
  const swapTx = await call1inchAPI<TxResponse>("/swap", swapParams);

  console.log("Swap transaction:", swapTx.tx);

  //   const txHash = await signAndSendTransaction(swapTx.tx);
  //   console.log("Swap transaction sent. Hash:", txHash);
}
