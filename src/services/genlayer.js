import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0x275371844972BF7CcA2c17E40E320b098b881a0C', // Bradbury Testnet (PvPPredictionArena v4.0.0 - emit_transfer fix Apr 6)
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
