/**
 * Global TypeScript declarations for the project
 */

// Fix JSX IntrinsicElements errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Enable modern React import style compatibility
declare module 'react' {
  // Re-export all standard React types 
  export * from 'react';
  
  // Add explicitly the types needed in our components
  export type FC<P = {}> = React.FunctionComponent<P>;
  export type MouseEvent<T = Element> = React.MouseEvent<T>;
  export type ReactNode = React.ReactNode;
}

// Define module declarations for external modules that don't have type definitions
declare module 'react-router' {
  import { ComponentType } from 'react';
  export const Link: ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;
}

// Define interface for token objects
interface Token {
  rank?: number;
  tokenSymbol: string;
  tokenName: string;
  totalSupply?: string;
  creator?: string;
  contractAddress: string;
  twitter?: string;
}

interface TokenCardProps {
  token: Token;
  index: number;
  key?: number | string;
}

interface TokenFetcherProps {
  index: number;
  key?: string | number;
  onTokenFetched: (token: Token, index: number) => void;
}
