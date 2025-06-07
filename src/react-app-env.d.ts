/// <reference types="react" />
/// <reference types="react-dom" />

// For CSS/SCSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Token interfaces
interface Token {
  rank?: number;
  tokenSymbol: string;
  tokenName: string;
  totalSupply?: string;
  creator?: string;
  contractAddress: string;
  twitter?: string;
  tokenAddress?: string;
  xUrl?: string;
  xUser?: string;
}

// For components
interface TokenCardProps {
  token: Token;
  index: number;
}

interface TokenFetcherProps {
  index: number;
  key?: string | number;
  onTokenFetched: (token: Token, index: number) => void;
}

// Fix for react-router if needed
declare module 'react-router' {
  import * as React from 'react';
  export const Link: React.ComponentType<{
    to: string;
    className?: string;
    children?: React.ReactNode;
  }>;
}
