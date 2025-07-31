// import { AllowanceResponse, ApproveTransactionResponse } from "@/types/1inch";
// import { call1inchAPI } from "./callApi";
// import { signAndSendTransaction } from "./sendTransaction";

// async function checkAllowance(
//   tokenAddress: string,
//   walletAddress: string
// ): Promise<bigint> {
//   console.log("Checking token allowance...");

//   const allowanceRes = await call1inchAPI<AllowanceResponse>(
//     "/approve/allowance",
//     {
//       tokenAddress: tokenAddress,
//       walletAddress: walletAddress,
//     }
//   );

//   const allowance = BigInt(allowanceRes.allowance);
//   console.log("Allowance:", allowance.toString());

//   return allowance;
// }

// async function approveIfNeeded(
//   tokenAddress: string,
//   walletAddress: string,
//   requiredAmount: bigint
// ): Promise<void> {
//   const allowance = await checkAllowance(tokenAddress, walletAddress);

//   if (allowance >= requiredAmount) {
//     console.log("Allowance is sufficient for the swap.");
//     return;
//   }

//   console.log("Insufficient allowance. Creating approval transaction...");

//   const approveTx = await call1inchAPI<ApproveTransactionResponse>(
//     "/approve/transaction",
//     {
//       tokenAddress: tokenAddress,
//       amount: requiredAmount.toString(),
//     }
//   );

//   console.log("Approval transaction details:", approveTx);

//   const txHash = await signAndSendTransaction({
//     to: approveTx.to,
//     data: approveTx.data,
//     value: approveTx.value,
//   });

//   console.log("Approval transaction sent. Hash:", txHash);
//   console.log("Waiting 10 seconds for confirmation...");
//   await new Promise((res) => setTimeout(res, 10000));
// }
