import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const bradbury = {
  id: 4221,
  name: 'GenLayer Bradbury',
  nativeCurrency: { 
    decimals: 18, 
    name: 'GEN Token', 
    symbol: 'GEN' 
  },
  rpcUrls: { 
    default: { http: ['https://rpc-bradbury.genlayer.com/'] }, 
    public: { http: ['https://rpc-bradbury.genlayer.com/'] } 
  },
  blockExplorers: { 
    default: { name: 'GenLayer Explorer', url: 'https://explorer-bradbury.genlayer.com/' } 
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'Oracle Duel',
  projectId: '072044806a646a788e6378900c8b6a12', // Placeholder RainbowKit Project ID
  chains: [bradbury],
  ssr: false, 
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
