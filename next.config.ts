import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: [
            '@chakra-ui/react',
            'react-icons',
            '@privy-io/react-auth',
        ],
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                ],
            },
        ];
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
