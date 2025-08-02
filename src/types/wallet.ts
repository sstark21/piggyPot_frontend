export interface WalletFunctionsDefinitions {
    sendTransaction: (tx: {
        to: string;
        data: string;
        value: bigint;
    }) => Promise<string>;
}
