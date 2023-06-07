import { getRpcNode } from '../hooks/useRpcNode';

import * as beta2 from './rpc/beta2';
import * as beta3 from './rpc/beta3';
import { getKeplr } from '../_helpers/keplr-utils';
import { getCurrentHeight } from '../_helpers/deployments-utils';
import { SDLSpec } from '../components/SdlConfiguration/settings';

export const closeDeployment = async (dseq: string) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.closeDeployment
    : beta2.deployments.closeDeployment;

  const owner = wallet.accounts[0].address;

  return mutateMethod(wallet, { owner, dseq: parseInt(dseq) });
};

export const fundDeployment = async ({ dseq, amount }: { dseq: string, amount: number }) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.fundDeployment
    : beta2.deployments.fundDeployment;

  const owner = wallet.accounts[0].address;

  return mutateMethod(wallet, { owner, dseq: parseInt(dseq) }, amount);
};

export const createDeployment = async (
  { sdl, depositor }: { sdl: SDLSpec | undefined; depositor?: string }
) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  if (!sdl) {
    return Promise.reject('No SDL provided');
  }

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.createDeployment
    : beta2.deployments.createDeployment;

  return mutateMethod(wallet, sdl, depositor);
};

export const createCertificate = async () => {
  const { rpcNode, networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.certificates.createAndBroadcastCertificate
    : beta2.certificates.createAndBroadcastCertificate;

  return mutateMethod(rpcNode, wallet);
};

export const revokeCertificate = async (certificate: string) => {
  const { rpcNode, networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.certificates.broadcastRevokeCertificate
    : beta2.certificates.broadcastRevokeCertificate;

  return mutateMethod(rpcNode, wallet, certificate);
};

export const createLease = async (bidId: {
  owner: string;
  dseq: Long;
  gseq: number;
  oseq: number;
  provider: string;
}) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.createLease
    : beta2.deployments.createLease;

  return mutateMethod(wallet, (bidId as any));
};

export const sendManifest = async ({ address, lease, sdl }: { address: string, lease: any, sdl: any }) => {
  const { networkType } = getRpcNode();

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.sendManifest
    : beta2.deployments.sendManifest;

  return mutateMethod(address, lease, sdl);
};

export const updateDeployment = async ({ deploymentId, sdl }: { deploymentId: object, sdl: SDLSpec | undefined }) => {
  const { networkType } = getRpcNode();
  const wallet = await getKeplr();

  if (!sdl) {
    return Promise.reject('No SDL provided');
  }

  const mutateMethod = networkType === 'testnet'
    ? beta3.deployments.updateDeployment
    : beta2.deployments.updateDeployment;

  return mutateMethod(wallet, deploymentId, sdl);
};