import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const studioChain = {
  id: 61999,
  name: 'GenLayer Studio',
  nativeCurrency: { 
    decimals: 18, 
    name: 'GEN Token', 
    symbol: 'GEN' 
  },
  rpcUrls: { 
    default: { http: ['https://studio.genlayer.com/api'] }, 
    public: { http: ['https://studio.genlayer.com/api'] } 
  },
  blockExplorers: { 
    default: { name: 'GenLayer Studio Explorer', url: 'https://explorer-studio.genlayer.com' } 
  },
  testnet: true,
};

const bradburyChain = {
  id: 4221,
  name: 'GenLayer Bradbury',
  nativeCurrency: { 
    decimals: 18, 
    name: 'GEN Token', 
    symbol: 'GEN' 
  },
  rpcUrls: { 
    default: { http: ['https://rpc-bradbury.genlayer.com'] }, 
    public: { http: ['https://rpc-bradbury.genlayer.com'] } 
  },
  blockExplorers: { 
    default: { name: 'Bradbury Explorer', url: 'https://explorer-bradbury.genlayer.com' } 
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'Oracle Duel',
  projectId: 'c404db5ce83332c4e9315bf8be24c350', // Updated RainbowKit Project ID
  chains: [studioChain, bradburyChain],
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
