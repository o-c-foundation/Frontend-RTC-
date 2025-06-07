import { NotificationProvider } from "@blockscout/app-sdk";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProofProvider } from "@vlayer/react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router";
import { Chain, defineChain } from "viem";
import { WagmiProvider } from "wagmi";
import { AppErrorBoundaryComponent } from "./components/layout/ErrorBoundary";
import { Layout } from "./components/layout/Layout";
import { steps } from "./utils/steps";

const queryClient = new QueryClient();
const appKitProjectId = `0716afdbbb2cc3df69721a879b92ad5b`;

// Define Base Chain directly instead of using environment variable
const baseChain = defineChain({
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
});

// Get actual URL dynamically
const getCurrentUrl = () => {
  return window.location.origin;
};

const chain = baseChain as Chain;
const chains: [Chain, ...Chain[]] = [chain];
const networks = chains;

const wagmiAdapter = new WagmiAdapter({
  projectId: appKitProjectId,
  chains,
  networks,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId: appKitProjectId,
  networks,
  defaultNetwork: chain,
  metadata: {
    name: "Press F",
    description: "Pay respects and create memes with Press F",
    url: getCurrentUrl(),
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  themeVariables: {
    "--w3m-color-mix": "#551fbc",
    "--w3m-color-mix-strength": 40,
  },
});

const App = () => {
  return (
    <div id="app">
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ProofProvider
            config={{
              proverUrl: import.meta.env.VITE_PROVER_URL,
              wsProxyUrl: import.meta.env.VITE_WS_PROXY_URL,
              notaryUrl: import.meta.env.VITE_NOTARY_URL,
              token: import.meta.env.VITE_VLAYER_API_TOKEN,
            }}
          >
            <NotificationProvider>
              <BrowserRouter>
                <ErrorBoundary FallbackComponent={AppErrorBoundaryComponent}>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      {steps.map((step) => (
                        <Route
                          key={step.path}
                          path={step.path}
                          element={<step.component />}
                        />
                      ))}
                    </Route>
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
            </NotificationProvider>
          </ProofProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
};

export default App;
