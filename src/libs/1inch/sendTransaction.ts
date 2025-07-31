// import { type Hex } from "viem";
// import { type TransactionPayload } from "@/types/1inch";
// import { publicClient, walletClient } from "@/libs/viem";
// import { base } from "viem/chains";

// export async function signAndSendTransaction(
//   tx: TransactionPayload
// ): Promise<string> {
//   console.log("Estimating gas for transaction...");
//   const gas = await publicClient.estimateGas({
//     account: config.walletAddress as Hex,
//     to: tx.to,
//     data: tx.data,
//     value: BigInt(tx.value),
//   });

//   const latestBlock = await publicClient.getBlock();
//   const baseFeePerGas = latestBlock.baseFeePerGas;

//   const nonce = await publicClient.getTransactionCount({
//     address: account.address,
//     blockTag: "pending",
//   });

//   console.log("Nonce:", nonce.toString());

//   try {
//     if (baseFeePerGas !== null && baseFeePerGas !== undefined) {
//       console.log("Using EIP-1559 transaction format");
//       const fee = await publicClient.estimateFeesPerGas();

//       return await walletClient.sendTransaction({
//         account,
//         to: tx.to,
//         data: tx.data,
//         value: BigInt(tx.value),
//         gas,
//         maxFeePerGas: fee.maxFeePerGas,
//         maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
//         chain: base,
//         nonce,
//         kzg: undefined,
//       });
//     } else {
//       console.log("Using legacy transaction format");
//       const gasPrice = await publicClient.getGasPrice();

//       return await walletClient.sendTransaction({
//         account,
//         to: tx.to,
//         data: tx.data,
//         value: BigInt(tx.value),
//         gas,
//         gasPrice,
//         chain: base,
//         nonce,
//         kzg: undefined,
//       });
//     }
//   } catch (err) {
//     console.error("Transaction signing or broadcasting failed");
//     console.error("Transaction data:", tx);
//     console.error("Gas:", gas.toString());
//     console.error("Nonce:", nonce.toString());
//     throw err;
//   }
// }
