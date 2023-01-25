import { QueryClientImpl as BankClient } from "cosmjs-types/cosmos/bank/v1beta1/query";
import { getRpc } from '@akashnetwork/akashjs/build/rpc';

import { rpcEndpoint } from "../atoms";

export async function getAccountBalance(address: string) {
  const rpc = await getRpc(rpcEndpoint);
  const client = new BankClient(rpc);
  const request = await client.Balance({
    address: address,
    denom: 'uakt'
  });

  return parseInt(request?.balance?.amount || "0");
}