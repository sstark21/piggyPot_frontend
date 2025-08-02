import { appConfig } from '@/config';

interface TokenPriceResponse {
    [tokenAddress: string]: string;
}

interface TokenPrices {
    [tokenAddress: string]: number;
}

/**
 * Get token prices in USD from 1inch API
 * @param tokenAddresses Array of token addresses to get prices for
 * @returns Object with token addresses as keys and USD prices as values
 */
export async function getTokenPrices(
    tokenAddresses: string[]
): Promise<TokenPrices> {
    try {
        // Use the proxy route
        const url = `/api/1inch?endpoint=/price/v1.1/8453&currency=USD`;

        console.log('Fetching token prices via proxy:', {
            url,
            tokenAddresses,
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TokenPriceResponse = await response.json();

        console.log('1inch price response:', data);

        // Convert string prices to numbers
        const prices: TokenPrices = {};
        for (const [address, price] of Object.entries(data)) {
            prices[address.toLowerCase()] = parseFloat(price);
        }

        return prices;
    } catch (error) {
        console.error('Error fetching token prices from 1inch:', error);
        throw new Error(`Failed to fetch token prices: ${error}`);
    }
}

/**
 * Convert USD amount to token amount based on current price
 * @param usdAmount Amount in USD
 * @param tokenAddress Token address
 * @param tokenDecimals Token decimals
 * @param tokenPrice Token price in USD
 * @returns Token amount in wei (as bigint)
 */
export function convertUSDToTokenAmount(
    usdAmount: number,
    tokenAddress: string,
    tokenDecimals: number,
    tokenPrice: number
): bigint {
    // Convert USD to token amount
    const tokenAmount = usdAmount / tokenPrice;

    // Convert to wei (multiply by 10^decimals)
    const weiAmount = tokenAmount * Math.pow(10, tokenDecimals);

    return BigInt(Math.floor(weiAmount));
}

/**
 * Get token price for a single token
 * @param tokenAddress Token address
 * @returns Token price in USD
 */
export async function getTokenPrice(tokenAddress: string): Promise<number> {
    const prices = await getTokenPrices([tokenAddress]);
    return prices[tokenAddress.toLowerCase()];
}
