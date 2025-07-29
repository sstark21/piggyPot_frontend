import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
// import { createStorage, http } from '@wagmi/core';
import { mainnet } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

export const config = createConfig({
    // projectId,
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(import.meta.env.VITE_CHAIN_RPC_URL),
    },
    // storage: createStorage({ storage: localStorage }),
    ssr: false,
});

// export const appKitConfig = {
//     adapters: [wagmiAdapter],
//     networks: [mainnet],
//     projectId,
//     customRpcUrls: {
//         'eip155:31337': [
//             {
//                 url: import.meta.env.VITE_CHAIN_RPC_URL,
//             },
//         ],
//     },
// };