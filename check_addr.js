import { privateKeyToAccount } from 'viem/accounts';
const PK = '0x7d8fcfb7d83c869cd0bb3097062b1e798ea1a4c18a500e6bff5de4d56c1163db';
const account = privateKeyToAccount(PK);
console.log('Derived Address:', account.address);
