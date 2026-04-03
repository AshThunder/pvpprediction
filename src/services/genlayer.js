import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0xA08F293AAFb2107477886ed090B72c66a1B3804b', // Bradbury Testnet (PvPPredictionArena v3.0.0)
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
