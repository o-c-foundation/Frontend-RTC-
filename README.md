# Press F: Tokenized Social Media Platform

## Introduction

Press F is a revolutionary blockchain application for tokenizing Twitter posts and creating tradeable meme coins on the Base network. The platform allows users to transform viral tweets into tradeable tokens, creating a new ecosystem where social media popularity can be directly monetized through cryptocurrency.

The name "Press F" pays homage to the internet meme originating from Call of Duty: Advanced Warfare, where players were prompted to "Press F to Pay Respects" - representing the internet culture that often drives meme coin popularity.

## Overview

The platform consists of two main components:

1. **Twitter Bot**: An automated system that monitors Twitter for specific hashtags or mentions and deploys new token contracts when predetermined conditions are met.

2. **Frontend Interface**: A React-based web interface for discovering, trading, and managing tokenized meme coins.

The application is built on the Base blockchain network (Chain ID: 8453), leveraging its high throughput and low transaction costs to provide a seamless user experience.

## Key Features

- **Automated Token Creation**: Deploy new ERC-20 tokens based on Twitter content
- **Token Trading**: Buy and sell tokenized memes with a bonding curve price model
- **Real-time Twitter Integration**: Connect Twitter social signals to token creation
- **Wallet Integration**: Connect various web3 wallets via WalletConnect
- **Base Network Optimized**: Built specifically for the Base L2 network

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│    Twitter API      │◄──────┤    Twitter Bot      │
│                     │       │   (Node.js)         │
└─────────────────────┘       └─────────┬───────────┘
                                        │
                                        ▼
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│    Base Blockchain  │◄──────┤  Smart Contracts    │
│    (Chain ID: 8453) │       │  (Solidity)         │
│                     │       │                     │
└─────────────────────┘       └─────────┬───────────┘
                                        │
                                        ▼
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│     Web Client      │◄──────┤  Frontend Server    │
│     (Browser)       │       │  (Nginx + React)    │
│                     │       │                     │
└─────────────────────┘       └─────────────────────┘
```

### Component Breakdown

#### 1. Twitter Bot (Backend Service)

- **Technology Stack**: Node.js, Twitter API v2
- **Function**: Monitors Twitter for specific hashtags and trigger conditions
- **Deployment**: Runs as a systemd service with automatic restart
- **Key Libraries**:
  - `twitter-api-v2`: For Twitter API integration
  - `ethers.js`: For blockchain interaction
  - `winston`: For logging

#### 2. Smart Contracts (Blockchain Layer)

- **Technology**: Solidity, Hardhat development environment
- **Deployed Contracts**:
  - PumpFun (`0x876a538356C56413A3f2D694c848ac824bF6B680`): Core contract handling token trading logic
  - TokenFactory (`0x8ABc0c5f1f85eF0D988f3b7721e0A07381a10abd`): Factory contract for deploying new token contracts
- **Network**: Base Mainnet (Chain ID: 8453)
- **Features**: Bonding curve implementation, automated liquidity provision, fees mechanism

#### 3. Frontend Application (Web Interface)

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **Web3 Integration**: Wagmi, WalletConnect
- **Styling**: TailwindCSS
- **Deployment**: Static files served via Nginx

## Smart Contract Details

### Contract Addresses

- **PumpFun**: `0x876a538356C56413A3f2D694c848ac824bF6B680`
- **TokenFactory**: `0x8ABc0c5f1f85eF0D988f3b7721e0A07381a10abd`
- **Network**: Base Mainnet (ChainID: 8453)

### PumpFun Contract

The PumpFun contract is the core trading engine that implements a bonding curve mechanism for token trading. When a user buys a token, the price increases according to the bonding curve formula; when selling, the price decreases.

#### Key Functions

```solidity
// Buy tokens with ETH
function buy(address tokenAddress, address referrer) external payable returns (uint256)

// Sell tokens for ETH
function sell(address tokenAddress, uint256 amount) external returns (uint256)

// Get current price of token based on bonding curve
function getBuyPrice(address tokenAddress, uint256 amount) public view returns (uint256)

// Get current sell price for tokens
function getSellPrice(address tokenAddress, uint256 amount) public view returns (uint256)

// Get token data including supply, balance and other metadata
function getToken(address tokenAddress) external view returns (Token memory)
```

### TokenFactory Contract

The TokenFactory contract is responsible for creating new tokens when triggered by the Twitter bot.

#### Key Functions

```solidity
// Create a new token based on Twitter details
function createToken(
    string memory tokenName,
    string memory tokenSymbol,
    uint256 initialSupply,
    string memory xUrl,
    string memory xUser
) external returns (address)

// Get count of all created tokens
function tokenCount() external view returns (uint256)

// Get token data by index
function tokens(uint256 index) external view returns (
    address tokenAddress,
    string memory tokenName,
    string memory tokenSymbol,
    uint256 totalSupply,
    string memory xUrl,
    string memory xUser
)
```

### Bonding Curve Implementation

The bonding curve used in PumpFun follows the formula:

```
price = basePrice * (1 + slope * supply^2)
```

Where:
- `basePrice` is the starting price of the token
- `slope` is the rate at which the price increases
- `supply` is the current token supply

This quadratic bonding curve ensures that early buyers get better prices, incentivizing early adoption while maintaining liquidity.

## Frontend Documentation

### Directory Structure

```
frontend/
├── dist/                   # Production build files
├── public/                 # Static assets
├── src/
│   ├── artifacts/          # Contract ABIs
│   ├── components/
│   │   ├── atoms/          # Basic UI components
│   │   ├── molecules/      # Compound UI components 
│   │   └── organisms/      # Feature-based components
│   │       ├── MintStep/   # Token minting workflow
│   │       ├── TokenListStep/ # Token listing component
│   │       └── TradeStep/  # Trading interface
│   ├── config/
│   │   └── chain.ts        # Blockchain configuration
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── .env.production        # Production environment variables
└── package.json           # Dependencies and scripts
```

### Key Components

#### 1. WalletConnect Integration

The application uses WalletConnect for wallet connectivity:

```typescript
// App.tsx
import { WagmiAdapter } from "@/lib/WagmiAdapter";
import { createWeb3Modal } from "@web3modal/wagmi/react";

// Dynamic metadata URL for WalletConnect modal
const getProjectId = () => "..."; // Your WalletConnect project ID

// Create WalletConnect modal
createWeb3Modal({
  wagmiConfig,
  projectId: getProjectId(),
  enableAnalytics: false,
  metadata: {
    name: "Press F",
    description: "Tokenize Twitter posts as meme coins",
    url: window.location.origin,
    icons: [`${window.location.origin}/logo.png`],
  },
});
```

#### 2. TokenList Component

Displays all tokens created by the platform:

```typescript
// TokenList.tsx simplified example
const TokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  // Use TokenFactory contract to fetch tokens
  const { data: tokenCount } = useReadContract({
    address: TOKEN_FACTORY_ADDRESS as `0x${string}`,
    abi: TOKEN_FACTORY_ABI,
    functionName: "tokenCount",
  });

  // Render token list with TokenRow component
  return (
    <div className="token-list">
      {loading ? (
        <div>Loading tokens...</div>
      ) : (
        tokens.map((token, index) => (
          <TokenRow key={token.tokenAddress} token={token} index={index} />
        ))
      )}
    </div>
  );
};
```

#### 3. TradeToken Component

Manages buying and selling tokens with bonding curve pricing:

```typescript
// TradeToken.tsx simplified example
const TradeToken = () => {
  const [amount, setAmount] = useState("");
  const { address } = useAccount();
  
  // Calculate buy price based on amount
  const { data: buyPrice } = useReadContract({
    address: PUMPFUN_ADDRESS as `0x${string}`,
    abi: PUMPFUN_ABI,
    functionName: "getBuyPrice",
    args: [tokenAddress as `0x${string}`, parseEther(amount || "0")],
  });
  
  // Execute buy transaction
  const { writeContractAsync } = useWriteContract();
  
  const handleBuy = async () => {
    try {
      const tx = await writeContractAsync({
        address: PUMPFUN_ADDRESS as `0x${string}`,
        abi: PUMPFUN_ABI,
        functionName: "buy",
        args: [tokenAddress as `0x${string}`, nullAddress],
        value: buyPrice,
      });
      // Handle transaction success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="trade-container">
      {/* Trade UI components */}
      <Button onClick={handleBuy}>Buy Token</Button>
    </div>
  );
};
```

## Twitter Bot Documentation

### Overview

The Twitter bot is a Node.js application that monitors Twitter for specific hashtags and triggers token creation when certain conditions are met. It interacts with the TokenFactory smart contract to deploy new tokens on the Base blockchain.

### Directory Structure

```
bot/
├── config/
│   └── config.js        # Configuration parameters
├── src/
│   ├── contracts/       # Contract interaction logic
│   ├── services/        # Core services
│   │   ├── twitter.js    # Twitter API integration
│   │   └── blockchain.js # Blockchain interaction
│   ├── utils/          # Utility functions
│   └── index.js        # Main entry point
├── package.json        # Dependencies
└── .env                # Environment variables
```

### Key Components

#### Twitter API Integration

The bot uses Twitter API v2 to monitor tweets in real-time:

```javascript
// twitter.js simplified example
const { TwitterApi } = require('twitter-api-v2');

class TwitterService {
  constructor(config) {
    this.client = new TwitterApi({
      appKey: config.TWITTER_API_KEY,
      appSecret: config.TWITTER_API_SECRET,
      accessToken: config.TWITTER_ACCESS_TOKEN,
      accessSecret: config.TWITTER_ACCESS_SECRET,
    });
    this.rules = [
      { value: '#PressF OR #PressF_Token -is:retweet -is:reply', tag: 'meme_tokens' },
    ];
  }

  async streamTweets(callback) {
    // Set up filtering rules
    await this.setupRules();
    
    // Start filtered stream
    const stream = await this.client.v2.searchStream();
    
    // Listen for tweets
    stream.on('data', async (tweet) => {
      try {
        await callback(tweet);
      } catch (error) {
        console.error('Error processing tweet:', error);
      }
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
    });
  }
}
```

#### Blockchain Integration

The bot interacts with the TokenFactory contract to create new tokens:

```javascript
// blockchain.js simplified example
const ethers = require('ethers');
const { TokenFactory } = require('../contracts');

class BlockchainService {
  constructor(config) {
    this.provider = new ethers.providers.JsonRpcProvider(config.RPC_URL);
    this.wallet = new ethers.Wallet(config.PRIVATE_KEY, this.provider);
    this.tokenFactory = new ethers.Contract(
      config.TOKEN_FACTORY_ADDRESS,
      TokenFactory.abi,
      this.wallet
    );
  }

  async createToken(tokenData) {
    const { name, symbol, initialSupply, tweetUrl, tweetUser } = tokenData;
    
    try {
      const tx = await this.tokenFactory.createToken(
        name,
        symbol,
        ethers.utils.parseEther(initialSupply.toString()),
        tweetUrl,
        tweetUser
      );
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }
}
