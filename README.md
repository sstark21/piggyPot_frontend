# Piggy Pot UI 🐷💰

A decentralized investment platform that automates DeFi strategies using Uniswap V3 liquidity positions and 1inch token swaps.

## 🎯 Overview

Piggy Pot UI is a Next.js-based web application that enables users to:

- **Embedded Wallet**: Privy generates embedded wallets for seamless DeFi interactions
- **Automated Investment**: Split investments between risky and conservative DeFi strategies
- **Token Swapping**: Use 1inch API for optimal token swaps
- **Liquidity Provision**: Create Uniswap V3 positions for yield generation
- **AI-Powered Pool Recommendations**: Backend provides intelligent pool suggestions

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Chakra UI, React Icons
- **Blockchain**: Ethers.js v5, Viem, Wagmi
- **Authentication**: Privy (Web3 Auth)
- **DeFi Integration**: Uniswap V3 SDK, 1inch API
- **State Management**: React Query (TanStack Query)
- **Backend**: [Piggy Pot Backend](https://github.com/0xdeval/piggy-pot) - AI-powered pool recommendations

### Key Components

#### 🔐 Authentication & Wallet

- **Embedded Wallets**: Privy generates embedded wallets for each user
- **Top-up Flow**: Users can top up their embedded wallet balance
- **Balance Tracking**: Real-time wallet balance monitoring
- **Seamless UX**: No external wallet connection required

#### 🤖 AI-Powered Pool Recommendations

- **Backend Integration**: Connected to [Piggy Pot Backend](https://github.com/0xdeval/piggy-pot)
- **Daily Metrics**: AI analyzes Uniswap data and 1inch metrics daily
- **Intelligent Suggestions**: Recommends optimal pools based on risk profile
- **Real-time Updates**: Pool recommendations update based on market conditions

#### 💰 Investment Workflow

1. **Wallet Top-up**: User tops up their embedded wallet balance
2. **Investment Amount**: User sets total investment amount
3. **Strategy Allocation**: Split between risky and conservative strategies
4. **Pool Recommendations**: Backend provides AI-powered pool suggestions
5. **make an investment**: under the hood:
    - **Token Swapping**: Convert USDC to target tokens via 1inch
    - **Liquidity Provision**: Create Uniswap V3 positions
    - **Position Management**: Track and manage liquidity positions

#### 🎯 Investment Strategies

**Risky Strategy**

- **Definition**: Pools containing at least one volatile token (e.g., WETH, WBTC)
- **Characteristics**: Higher volatility, potential for higher returns
- **Examples**: WETH/USDC, WBTC/USDC, WETH/USDT pairs

**Conservative Strategy**

- **Definition**: Pools containing only stablecoins (e.g., USDC, USDT, DAI)
- **Characteristics**: Lower volatility, consistent yield generation
- **Examples**: USDC/USDT, USDC/DAI, USDT/DAI pairs

## 🚀 Getting Started

### Prerequisites

- **Bun**: This project requires Bun runtime (not Node.js)
- Base network RPC access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd piggy-pot-ui

# Install dependencies (using Bun)
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id

# 1inch API
NEXT_PUBLIC_ONE_INCH_API_KEY=your_1inch_api_key

# Backend API
NEXT_PUBLIC_API_URL=your_backend_url
```

### Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (1inch proxy, backend communication)
│   ├── dashboard/         # Dashboard page (investment overview, balance display)
│   ├── invest/           # Investment workflow (stepper, amount, strategy)
│   └── settings/         # Settings page (token revoke, transfers)
├── components/            # React components
│   ├── layouts/          # Layout components (investment workflow, dashboard)
│   ├── providers/        # Context providers (Privy, Chakra, React Query)
│   └── ui/              # UI components (buttons, forms, modals)
├── hooks/                # Custom React hooks
│   ├── useBalance.ts     # Wallet balance tracking
│   ├── useSwap.ts        # 1inch token swapping
│   ├── use1inchApprove.ts # 1inch token approvals
│   ├── useUniswapApprove.ts # Uniswap token approvals
│   └── usePoolsRecommendations.ts # Backend pool recommendations
├── libs/                 # External library integrations
│   ├── 1inch/           # 1inch API integration (swaps, prices, balances)
│   │   ├── callApi.ts    # Generic API caller with proxy
│   │   ├── getTokenPrices.ts # Real-time token price fetching
│   │   └── executeSwaps.ts # Token swap execution
│   └── uniswap/         # Uniswap V3 integration
│       ├── pool.ts       # Pool information and configuration
│       ├── position.ts   # Position creation and minting
│       └── createToken.ts # Token object creation
├── types/                # TypeScript type definitions
│   ├── 1inch/           # 1inch API response types
│   ├── backend/          # Backend API response types
│   ├── uniswap/         # Uniswap SDK types
│   └── user.ts          # User and wallet types
├── config/               # Configuration files
│   ├── constants.ts      # Contract addresses, network config
│   ├── oneInch.ts       # 1inch API configuration
│   └── index.ts         # App configuration
├── utils/                # Utility functions
│   ├── abis.ts          # Contract ABIs (ERC20, Uniswap)
│   ├── converter.ts     # Token amount conversions
│   └── issuesProcessing.ts # Error handling utilities
└── mocks/                # Mock data for development
    └── recommendations.ts # Mock pool recommendations
```

## 🔧 Key Features

### Investment Workflow

- **Step-by-step process**: Top-up → Amount → Strategy → Execution
- **Real-time validation**: Balance checks and allowance verification
- **Progress tracking**: Visual progress indicators
- **Error handling**: Comprehensive error management

### AI-Powered Pool Recommendations

- **Daily Analysis**: Backend processes Uniswap data and 1inch metrics daily
- **Risk Classification**: Automatically categorizes pools as risky or conservative
- **Intelligent Matching**: Suggests pools based on user's risk allocation
- **Market Adaptation**: Recommendations adapt to changing market conditions

### Token Management

- **Automatic approvals**: Handle token allowances
- **Price fetching**: Real-time token prices via 1inch
- **Gas optimization**: Efficient transaction batching

### Position Management

- **Uniswap V3 positions**: Create concentrated liquidity positions
- **Range optimization**: Automatic tick range calculation
- **Slippage protection**: Configurable slippage tolerance

## 🛠️ Development

### Adding New Features

1. **Create components** in `src/components/`
2. **Add types** in `src/types/`
3. **Create hooks** in `src/hooks/`
4. **Update pages** in `src/app/`

### Testing

```bash
# Run linting
bun run lint

# Type checking
bunx tsc --noEmit
```

## 📚 API Documentation

See [1INCH_API.md](./docs/1INCH_API.md) for detailed 1inch API integration documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the DeFi community**
