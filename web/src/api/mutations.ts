import { getRpcNode } from '../hooks/useRpcNode';

import * as beta2 from './rpc/beta2';
import * as beta3 from './rpc/beta3';
import { getKeplr } from '../_helpers/keplr-utils';

export const closeDeployment = async (dseq: string) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.closeDeployment
    : beta2.deployments.closeDeployment;

  const owner = wallet.accounts[0].address;

  return mutateMethod(wallet, { owner, dseq: parseInt(dseq) });
};
