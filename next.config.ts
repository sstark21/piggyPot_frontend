import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: [
            '@chakra-ui/react',
            'react-icons',
            '@privy-io/react-auth',
        ],
    },
    webpack: config => {
        config.cache = {
            type: 'filesystem',
            compression: 'gzip',
            maxMemoryGenerations: 1,
        };
        return config;
    },
};

export default nextConfig;
