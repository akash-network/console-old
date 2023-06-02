import { QueryClientImpl as BankClient } from 'cosmjs-types/cosmos/bank/v1beta1/query';
import { getRpc } from '@akashnetwork/akashjs/build/rpc';

import { getRpcNode } from '../../hooks/useRpcNode';

export async function getAccountBalance(address: string) {
  const { rpcNode } = getRpcNode();

  const rpc = await getRpc(rpcNode);
  const client = new BankClient(rpc);
  const request = await client.Balance({
    address: address,
    denom: 'uakt',
  });

  return parseInt(request?.balance?.amount || '0');
}
