import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  4221: '0x0D4eb9E4b25e83E001aDA22E3D4415CB813f9D7B', // Bradbury Testnet
};

export const getGenClient = (chainId) => {
  return createClient({
    chain: testnetBradbury,
    transport: '/rpc'
  });
};
