import fetch from 'node-fetch';

const url = 'https://zksync-os-testnet-genlayer.zksync.dev/';

async function check() {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1,
    }),
  });

  const data = await response.json();
  console.log('Gas Price:', data.result);
}

check();
