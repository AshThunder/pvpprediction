import fetch from 'node-fetch';

const hash = '0x2298740ab5f7bef7e5559a80ac4a243f183641c335109a02768db40a1c4920be';
const url = 'https://zksync-os-testnet-genlayer.zksync.dev/';

async function check() {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [hash],
      id: 1,
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
