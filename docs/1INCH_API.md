# 1inch API Integration Documentation

This document describes how 1inch API is integrated and used throughout the Piggy Pot UI project.

## 📋 Overview

The project uses 1inch API for:

- **Token Swapping**: Optimal token swaps with best routing
- **Price Fetching**: Real-time token prices in USD
- **Balance Checking**: Wallet token balances
- **Allowance Management**: Token approval status
- **Portfolio Management**: Check profit/loss of investments for a time range

## 📁 File Structure

```
src/
├── app/api/1inch/
│   └── route.ts              # API proxy endpoint
├── libs/1inch/
│   ├── callApi.ts            # Generic API caller
│   ├── getTokenPrices.ts     # Price fetching
│   └── executeSwaps.ts       # Swap execution
├── hooks/
│   ├── useSwap.ts            # Swap hook
│   ├── useBalance.ts         # Balance hook
│   └── use1inchApprove.ts    # Approval hook
└── types/1inch/
    ├── swap.ts               # Swap types
    ├── balance.ts            # Balance types
    └── allowance.ts          # Allowance types
```

## 🔌 API Endpoints Used

### 1. Token Swapping (`/swap/v6.1/8453`)

**Purpose**: Execute token swaps with optimal routing

**Usage**:

```typescript
// In useSwap.ts
const swapTx = await call1inchAPI<TxResponse>({
    endpoint: `/swap/v6.1/8453`,
    params: {
        src: tokenFrom,
        dst: tokenTo,
        amount: amountWei,
        from: walletAddress,
        slippage: 1, // 1% slippage
    },
});
```

**Parameters**:

- `src`: Source token address
- `dst`: Destination token address
- `amount`: Amount in wei
- `from`: User wallet address
- `slippage`: Slippage tolerance (%)

### 2. Token Prices (`/price/v1.1/8453`)

**Purpose**: Get real-time token prices in USD

**Usage**:

```typescript
// In getTokenPrices.ts
const url = `/api/1inch?endpoint=/price/v1.1/8453&currency=USD`;
const response = await fetch(url);
const data = await response.json();
```

**Response Format**:

```json
{
    "0x4200000000000000000000000000000000000006": "3512.72552724",
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "1.00000000"
}
```

### 3. Token Balances (`/balance/v1.2/8453`)

**Purpose**: Get wallet token balances

**Usage**:

```typescript
// In useBalance.ts
const balanceRes = await call1inchAPI<BalanceResponse>({
    endpoint: `/balance/v1.2/8453`,
    params: {
        address: walletAddress,
        tokens: tokenAddresses.join(','),
    },
});
```

### 4. Token Allowances (`/approve/allowance`)

**Purpose**: Check token approval status

**Usage**:

```typescript
// In use1inchApprove.ts
const allowanceRes = await call1inchAPI<AllowanceResponse>({
    endpoint: `/approve/allowance`,
    params: {
        tokenAddress,
        walletAddress,
        spenderAddress,
    },
});
```

## 🛠️ Implementation Details

### API Proxy (`/api/1inch/route.ts`)

```typescript
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const queryParams = Object.fromEntries(searchParams.entries());

    // Remove endpoint from query params
    delete queryParams.endpoint;

    const apiKey = process.env.NEXT_PUBLIC_ONE_INCH_API_KEY;
    const baseUrl = 'https://api.1inch.dev';

    const url = new URL(`${baseUrl}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
    });

    return NextResponse.json(await response.json());
}
```

### Generic API Caller (`libs/1inch/callApi.ts`)

```typescript
export async function call1inchAPI<T>(
    endpoint: string,
    params: Record<string, string>
): Promise<T> {
    const proxyUrl = new URL('/api/1inch', window.location.origin);
    proxyUrl.searchParams.set('endpoint', endpoint);

    Object.entries(params).forEach(([key, value]) => {
        proxyUrl.searchParams.set(key, value);
    });

    const response = await fetch(proxyUrl.toString());

    if (!response.ok) {
        const body = await response.text();
        throw new Error(
            `1inch API returned status ${response.status}: ${body}`
        );
    }

    return response.json();
}
```

## 🎯 Use Cases in the Project

### 1. Investment Workflow

**File**: `src/components/layouts/investment/investmentWorkflow.tsx`

```typescript
// Get token prices for USD conversion
const tokenPrices = await getTokenPrices([pool.token0, pool.token1]);

// Convert USD amounts to token amounts
const token0AmountBigInt = convertUSDToTokenAmount(
    token0AmountUSD,
    pool.token0,
    pool.token0Decimals,
    tokenPrices[pool.token0.toLowerCase()]
);
```

### 2. Token Swapping

**File**: `src/hooks/useSwap.ts`

```typescript
const swapTokens = async (
    tokenFrom: string,
    tokenTo: string,
    amount: string,
    walletAddress: string
) => {
    const swapTx = await call1inchAPI<TxResponse>({
        endpoint: `/swap/v6.1/8453`,
        params: {
            src: tokenFrom,
            dst: tokenTo,
            amount,
            from: walletAddress,
            slippage: 1,
        },
    });

    return swapTx;
};
```

### 3. Balance Checking

**File**: `src/hooks/useBalance.ts`

```typescript
const fetchBalance = async (walletAddress: string) => {
    const balanceRes = await call1inchAPI<BalanceResponse>({
        endpoint: `/balance/v1.2/8453`,
        params: {
            address: walletAddress,
            tokens: tokenAddresses.join(','),
        },
    });

    return balanceRes;
};
```

## 🔒 Security Considerations

### API Key Management

- **Server-side storage**: API keys stored in environment variables
- **Proxy pattern**: All requests go through Next.js API routes
- **No client exposure**: API keys never exposed to client-side code

### Error Handling

```typescript
try {
    const response = await call1inchAPI<T>(endpoint, params);
    return response;
} catch (error) {
    console.error('1inch API error:', error);
    throw new Error(`Failed to call 1inch API: ${error}`);
}
```

### Rate Limiting

- **Request batching**: Multiple requests combined where possible
- **Caching**: Price data cached to reduce API calls
- **Error retries**: Automatic retry on rate limit errors

## 📊 Monitoring & Debugging

### Logging

```typescript
console.log('1inch API request:', {
    endpoint,
    params,
    url: proxyUrl.toString(),
});

console.log('1inch API response:', response);
```

### Error Tracking

- **Network errors**: Connection timeouts and failures
- **API errors**: Invalid parameters and rate limits
- **Response validation**: Type checking and data validation

## 🚀 Best Practices

### 1. Parameter Validation

```typescript
if (!tokenAddress || !walletAddress) {
    throw new Error('Missing required parameters');
}
```

### 2. Type Safety

```typescript
interface SwapResponse {
    tx: {
        to: string;
        data: string;
        value: string;
    };
}
```

### 3. Error Recovery

```typescript
const retryWithBackoff = async (fn: () => Promise<any>, retries = 3) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return retryWithBackoff(fn, retries - 1);
        }
        throw error;
    }
};
```

## 📈 Performance Optimization

### 1. Request Batching

- Combine multiple price requests into single API call
- Use comma-separated token addresses for bulk operations

### 2. Caching Strategy

- Cache price data for 30 seconds
- Cache allowance data for 5 minutes
- Cache balance data for 1 minute

### 3. Lazy Loading

- Load prices only when needed
- Defer non-critical API calls

## 🔄 Future Enhancements

### Planned Features

1. **Multi-chain support**: Extend beyond Base network
2. **Advanced routing**: Custom routing algorithms
3. **Gas optimization**: Better gas estimation
4. **MEV protection**: Sandwich attack prevention

### API Version Updates

- Monitor 1inch API version updates
- Plan migration strategies
- Maintain backward compatibility

---

**Last Updated**: December 2024  
**API Version**: v6.1 (swaps), v1.1 (prices), v1.2 (balances)  
**Network**: Base (Chain ID: 8453)
