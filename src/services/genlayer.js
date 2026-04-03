import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0xD31CB27DD6Ca122c4f5d1733C093251892bc0a28', // Bradbury Testnet (PvPPredictionArena v3.0.0)
};

export const getGenClient = (chainId) => {
  return createClient({
    chain: {
      ...testnetBradbury,
      name: 'GenLayer Testnet Chain',
      rpcUrls: {
        default: { http: ['https://zksync-os-testnet-genlayer.zksync.dev'] },
        public: { http: ['https://zksync-os-testnet-genlayer.zksync.dev'] },
      }
    },
    transport: 'https://zksync-os-testnet-genlayer.zksync.dev'
  });
};
