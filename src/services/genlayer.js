import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

import { CONTRACT_ADDRESS, CONTRACT_SUPPORTS_BALANCE } from './contract_address';

export { CONTRACT_SUPPORTS_BALANCE };

export const CONTRACT_ADDRESSES = {
  // GenLayer Bradbury Testnet
  4221: CONTRACT_ADDRESS,
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
