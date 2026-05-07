import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

import { CONTRACT_ADDRESS, CONTRACT_SUPPORTS_BALANCE } from './contract_address';

export { CONTRACT_SUPPORTS_BALANCE };

export const CONTRACT_ADDRESSES = {
  // GenLayer Studio Network
  61999: CONTRACT_ADDRESS,
};

export const getGenClient = (chainId, account) => {
  return createClient({
    chain: {
      ...studionet,
      name: 'GenLayer Studio',
      rpcUrls: {
        default: { http: ['https://studio.genlayer.com/api'] },
        public: { http: ['https://studio.genlayer.com/api'] },
      }
    },
    transport: 'https://studio.genlayer.com/api',
    account: account
  });
};
