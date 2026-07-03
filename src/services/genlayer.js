import { createClient } from 'genlayer-js';
import { studionet, testnetBradbury } from 'genlayer-js/chains';

import { CONTRACT_ADDRESSES, CONTRACT_SUPPORTS_BALANCE } from './contract_address';

export { CONTRACT_ADDRESSES, CONTRACT_SUPPORTS_BALANCE };

export const getGenClient = (chainId = 61999, account = undefined) => {
  if (chainId === 4221) {
    return createClient({
      chain: testnetBradbury,
      transport: 'https://rpc-bradbury.genlayer.com',
      account: account
    });
  }
  
  return createClient({
    chain: {
      ...studionet,
      name: 'GenLayer Studio',
    },
    transport: 'https://studio.genlayer.com/api',
    account: account
  });
};
