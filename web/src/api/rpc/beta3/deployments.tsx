import {
  QueryClientImpl as DeploymentClient,
  QueryDeploymentRequest,
  QueryDeploymentsRequest,
} from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta3/query';
import {
  QueryClientImpl as ProviderClient,
  QueryProviderRequest,
} from '@akashnetwork/akashjs/build/protobuf/akash/provider/v1beta3/query';
import {
  QueryBidsRequest,
  QueryClientImpl as MarketClient,
  QueryLeaseRequest,
  QueryLeasesRequest,
} from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/query';
import {
  MsgCloseDeployment,
  MsgCreateDeployment,
  MsgDepositDeployment,
  MsgUpdateDeployment,
} from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta3/deploymentmsg';
import { getMsgClient, getRpc } from '@akashnetwork/akashjs/build/rpc';
import { leaseEventsPath, leaseStatusPath, serviceLogsPath, submitManifestPath } from './paths';
import { KeplrWallet } from '../../../recoil/atoms';
import {
  Lease,
  LeaseID,
  MsgCreateLease,
} from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/lease';
import { loadActiveCertificate, TLSCertificate } from './certificates';
import { mtlsFetch, proxyWSS } from '../../rest/mtls';
import {
  DeploymentGroups,
  getCurrentHeight,
  Manifest,
  ManifestVersion,
  ManifestYaml,
} from '../../../_helpers/deployments-utils';
import { BidID } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/bid';
import { fetchRpcNodeStatus } from './rpc';
import { LeaseStatus } from '../../../types';
import logging from '../../../logging';
import { getRpcNode } from '../../../hooks/useRpcNode';
import { retry } from '../../../_helpers/async-utils';

// 5AKT aka 5000000uakt
export const defaultInitialDeposit = 5000000;

function getTypeUrl<T extends { $type: string }>(type: T) {
  return `/${type.$type}`;
}

export const fetchDeployment = async (owner: string, dseq: string, rpcEndpoint: string) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new DeploymentClient(rpc);

  const request = QueryDeploymentRequest.fromJSON({
    id: {
      owner: owner,
      dseq: dseq,
    },
  });

  const deployment = await client.Deployment(request);
  const leases = await fetchLease({ owner, dseq });

  return {
    deployment,
    leases,
  };
};

export const fetchDeploymentCount = async (
  filters: {
    owner?: string;
  },
  rpcEndpoint: string
) => {
  const pagination = {
    countTotal: true,
    limit: 1,
  };
  const rpc = await getRpc(rpcEndpoint);
  const client = new DeploymentClient(rpc);
  const response = await client.Deployments(
    QueryDeploymentsRequest.fromPartial({ pagination, filters })
  );
  return Number(response?.pagination?.total?.toString());
};

export const fetchDeploymentList = async ({ owner, state }: { owner: string, state?: string }, rpcNode: string) => {
  const pagination = { limit: 100 };
  const filters = { owner, state };

  const deploymentCount = await fetchDeploymentCount({ owner: filters.owner }, rpcNode);
  if (deploymentCount > 100) {
    pagination.limit = deploymentCount;
  }
  const rpc = await getRpc(rpcNode);
  const client = new DeploymentClient(rpc);

  return client.Deployments(QueryDeploymentsRequest.fromPartial({ pagination, filters }));
};

export const fetchBidsList = async (
  filters: { owner: string; dseq: string },
  rpcEndpoint: string
) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new MarketClient(rpc);

  return client.Bids(QueryBidsRequest.fromJSON({ filters }));
};

export const fetchLeaseListActive = async ({ owner }: { owner: string }) => {
  const { rpcNode } = getRpcNode();
  const rpc = await getRpc(rpcNode);
  const client = new MarketClient(rpc);

  return client.Leases(
    QueryLeasesRequest.fromPartial({
      filters: { owner, state: 'active' },
      pagination: { limit: 5000 },
    })
  );
};

export const fetchLease = async (params: { owner: string; dseq: string }) => {
  const { rpcNode } = getRpcNode();
  const rpc = await getRpc(rpcNode);
  const client = new MarketClient(rpc);

  return client.Leases(QueryLeasesRequest.fromPartial({ filters: params }));
};

export const fetchLeaseStatus = async (lease: Lease, rpcEndpoint: string) => {
  const cert = await loadActiveCertificate();

  if (!lease || !lease.leaseId || cert.$type !== 'TLS Certificate') return;

  const leaseId = LeaseID.toJSON(lease.leaseId) as {
    dseq: string;
    gseq: string;
    oseq: string;
  };

  const url = leaseStatusPath(leaseId);
  const rpc = await getRpc(rpcEndpoint);
  const client = new ProviderClient(rpc);
  const request = QueryProviderRequest.fromPartial({
    owner: lease.leaseId.provider,
  });

  const provider: any = await client.Provider(request);
  const providerFetch = mtlsFetch(cert, provider.provider.hostUri);

  return providerFetch(url).then(
    (response) => response.ok && response.json(),
    (err) => {
      console.log(err);
      return null;
    }
  ) as Promise<LeaseStatus>;
};

export const watchLeaseLogs = async (address: string, provider: any, lease: any, message: any) => {
  const leaseId = {
    dseq: lease.leaseId.dseq.low,
    gseq: lease.leaseId.gseq,
    oseq: lease.leaseId.oseq,
  };
  const cert = await loadActiveCertificate(address);
  const url = serviceLogsPath(leaseId);
  const providerUri = new URL(provider.provider.hostUri);
  const upstream = `upstream/${providerUri.hostname}:${providerUri.port}`;
  const socket = new WebSocket(`${proxyWSS}/${upstream}/${url}?follow=true`, ['log-protocol']);

  if (cert.$type !== 'TLS Certificate') {
    return Promise.reject('No certificate available');
  }

  socket.onopen = () => {
    socket.send(createCertificateMessage(cert));
  };

  socket.onmessage = message;

  return socket;
};

export const watchLeaseEvents = async (
  address: string,
  provider: any,
  lease: any,
  message: any
) => {
  const obj: any = Lease.toJSON(lease.lease);
  const cert = await loadActiveCertificate(address);
  const url = leaseEventsPath(obj.leaseId);

  const providerUri = new URL(provider.provider.hostUri);
  const upstream = `upstream/${providerUri.hostname}:${providerUri.port}`;

  if (cert.$type !== 'TLS Certificate') {
    return Promise.reject('No certificate available');
  }

  const socket = new WebSocket(`${proxyWSS}/${upstream}/${url}?follow=true`, ['event-protocol']);

  socket.onopen = () => {
    socket.send(createCertificateMessage(cert));
  };

  socket.onmessage = message;

  return socket;
};

function createCertificateMessage(cert: TLSCertificate): string {
  return JSON.stringify({
    type: 'certificate',
    certificate: {
      csr: cert.csr,
      privateKey: cert.privateKey,
    },
  });
}

export async function fundDeployment(
  wallet: KeplrWallet,
  deploymentId: { dseq: number; owner: string },
  quantity: number
) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const { rpcNode } = getRpcNode();

  if (!signer || !deploymentId) return;

  const client = await getMsgClient(rpcNode, signer);
  const amount = {
    denom: 'uakt',
    amount: quantity.toString(),
  };

  const msg = {
    typeUrl: getTypeUrl(MsgDepositDeployment),
    value: MsgDepositDeployment.fromPartial({
      id: deploymentId,
      depositor: account.address,
      amount,
    }),
  };

  return client.signAndBroadcast(
    account.address,
    [msg],
    'auto',
    `Send ${(quantity / 10 ** 6).toFixed(2)} AKT to deployment`
  );
}

export async function closeDeployment(wallet: KeplrWallet, deploymentId: { dseq: number, owner: string }) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const { rpcNode } = getRpcNode();

  if (!signer || !deploymentId) return;

  const client = await getMsgClient(rpcNode, signer);
  const msg = {
    typeUrl: getTypeUrl(MsgCloseDeployment),
    value: MsgCloseDeployment.fromPartial({
      id: deploymentId,
    }),
  };

  return client.signAndBroadcast(account.address, [msg], 'auto', 'Close deployment');
}

export async function createDeployment(
  wallet: KeplrWallet,
  sdl: any,
  depositor: string | undefined = undefined
) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const { rpcNode } = getRpcNode();
  const status = await fetchRpcNodeStatus(rpcNode);

  if (!signer) {
    return Promise.reject('Unable to initialize signing client');
  }

  const client = await getMsgClient(rpcNode, signer);
  const groups = DeploymentGroups(sdl, 'beta3');
  const ver = await ManifestVersion(sdl, 'beta3');

  const msg = {
    typeUrl: getTypeUrl(MsgCreateDeployment),
    value: MsgCreateDeployment.fromPartial({
      // Group find in SDL
      id: {
        owner: account.address,
        dseq: status.sync_info.latest_block_height,
      },
      groups: groups,
      deposit: {
        denom: 'uakt',
        amount: '5000000',
      },
      // Version is actually a checksum of manifest
      version: ver,
      depositor: depositor || account.address,
    }),
  };

  console.log(msg);

  const tx = await client.signAndBroadcast(account.address, [msg], 'auto', 'Creating the deployment');

  return {
    deploymentId: {
      owner: account.address,
      dseq: status.sync_info.latest_block_height,
    },
    tx,
  };
}

export async function updateDeployment(wallet: KeplrWallet, deploymentId: any, sdl: any) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const { rpcNode } = getRpcNode();

  if (!signer) {
    return Promise.reject('Unable to initialize signing client');
  }

  const client = await getMsgClient(rpcNode, signer);
  const ver = await ManifestVersion(sdl, 'beta3');

  const msg = {
    typeUrl: getTypeUrl(MsgUpdateDeployment),
    value: MsgUpdateDeployment.fromPartial({
      id: deploymentId,
      version: ver,
    }),
  };

  const tx = await client.signAndBroadcast(account.address, [msg], 'auto', 'Update the deployment');

  return {
    deploymentId,
    tx,
  };
}

export async function createLease(wallet: KeplrWallet, bidId: BidID) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const { rpcNode } = getRpcNode();

  if (!signer || !bidId) return;

  const client = await getMsgClient(rpcNode, signer);
  const msg = {
    typeUrl: getTypeUrl(MsgCreateLease),
    value: MsgCreateLease.fromJSON({
      bidId,
    }),
  };

  return client
    .signAndBroadcast(account.address, [msg], 'auto', 'Create lease for deployment')
    .then(async () => {
      const rpc = await getRpc(rpcNode);
      const queryClient = new MarketClient(rpc);
      const qmsg = QueryLeaseRequest.fromJSON({ id: bidId });

      return queryClient.Lease(qmsg).then((response: any) => response.lease);
    });
}

export async function sendManifest(address: string, lease: Lease, sdl: any) {
  const obj: any = Lease.toJSON(lease);
  const dseq = `${lease?.leaseId?.dseq?.low}`;
  const url = submitManifestPath(dseq);
  const cert = await loadActiveCertificate(address);
  const { rpcNode } = getRpcNode();

  if (cert.$type !== 'TLS Certificate') {
    return Promise.reject('No certificate available');
  }

  const rpc = await getRpc(rpcNode);
  const client = new ProviderClient(rpc);
  const request = QueryProviderRequest.fromPartial({
    owner: obj.leaseId.provider,
  });

  const provider: any = await client.Provider(request);
  const providerFetch = mtlsFetch(cert, provider.provider.hostUri);
  const jsonStr = ManifestYaml(sdl, 'beta3');

  const attemptSend = () => {
    return providerFetch(url, {
      method: 'PUT',
      body: jsonStr,
    }).then((result) => {
      if (result.ok) {
        return result;
      }

      return Promise.reject(result);
    });
  };

  return retry(attemptSend, [1000, 3000, 5000])
    .catch((error: any) => {
      logging.error('Error sending manifest to provider. This is likely an issue with the provider.');
      console.error(error);
    });
}

export async function newDeploymentData(
  apiEndpoint: string,
  yamlJson: string,
  dseq: number,
  fromAddress: string,
  deposit = defaultInitialDeposit,
  depositorAddress = null
) {
  const groups = DeploymentGroups(yamlJson, 'beta3');
  const mani = Manifest(yamlJson, 'beta3');
  const ver = await ManifestVersion(yamlJson, 'beta3');
  const id = {
    owner: fromAddress,
    dseq: dseq,
  };
  const _deposit = {
    denom: 'uakt',
    amount: deposit.toString(),
  };

  if (!id.dseq) {
    id.dseq = await getCurrentHeight(apiEndpoint);
  }

  return {
    sdl: yamlJson,
    manifest: mani,
    groups: groups,
    deploymentId: id,
    orderId: [],
    leaseId: [],
    version: ver,
    deposit: _deposit,
    depositor: depositorAddress || fromAddress,
  };
}
