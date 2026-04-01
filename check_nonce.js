import fetch from 'node-fetch';

const url = 'https://zksync-os-testnet-genlayer.zksync.dev/';
const address = '0x25b7a7d21cCf349fbA8245209A25Bbb36fBe4ffD';

async function check() {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  const data = await response.json();
  console.log('Nonce:', data.result);
}

check();
