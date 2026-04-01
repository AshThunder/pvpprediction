import { createClient } from 'genlayer-js';
import { testnetBradbury as bradbury } from 'genlayer-js/chains';
import { formatEther } from 'viem';

const RPC_URL = 'https://zksync-os-testnet-genlayer.zksync.dev/'; 
const ADDRESS = '0x25b7a7d21cCf349fbA8245209A25Bbb36fBe4ffD';

async function main() {
  const client = createClient({
    chain: bradbury,
    transport: RPC_URL,
  });

  try {
    console.log('Using RPC:', RPC_URL);
    const balance = await client.getBalance({ address: ADDRESS });
    console.log(`Balance of ${ADDRESS}: ${formatEther(balance)} GEN`);
    
    const chainId = await client.getChainId();
    console.log('Chain ID:', chainId);
  } catch (err) {
    console.error('FAILED:', err);
  }
}

main();
