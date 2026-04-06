import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0x91169cb380626872725EbE4C5dd83121de0D881F', // Bradbury Testnet (PvPPredictionArena v3.0.0 - Redeployed Apr 6, Custom Consensus)
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
