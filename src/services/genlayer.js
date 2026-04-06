import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0x6421C3e431BfF70B8A3d88811Cc881e229a04F0E', // Bradbury Testnet (PvPPredictionArena v3.0.0 - Redeployed Apr 6)
};

export const getGenClient = (chainId, account) => {
  return createClient({
    chain: {
      ...testnetBradbury,
      name: 'GenLayer Testnet Chain',
      rpcUrls: {
        default: { http: ['https://rpc-bradbury.genlayer.com'] },
        public: { http: ['https://rpc-bradbury.genlayer.com'] },
      }
    },
    transport: 'https://rpc-bradbury.genlayer.com',
    account: account
  });
};
