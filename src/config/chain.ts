// Chain configuration for BASE network
export const chainConfig = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://base-mainnet.g.alchemy.com/v2/0KD6bIDeLf5vD2LJvanlW'] },
    default: { http: ['https://base-mainnet.g.alchemy.com/v2/0KD6bIDeLf5vD2LJvanlW'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
};

// Contract addresses
export const PUMPFUN_ADDRESS = '0x876a538356C56413A3f2D694c848ac824bF6B680';
export const TOKEN_FACTORY_ADDRESS = '0x8ABc0c5f1f85eF0D988f3b7721e0A07381a10abd';
