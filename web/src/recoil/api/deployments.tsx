import {
  QueryClientImpl as DeploymentClient,
  QueryDeploymentRequest,
  QueryDeploymentsRequest,
  QueryDeploymentsResponse,
} from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/query';
import {
  QueryClientImpl as ProviderClient,
  QueryProviderRequest,
} from '@akashnetwork/akashjs/build/protobuf/akash/provider/v1beta2/query';
import {
  QueryBidsRequest,
  QueryClientImpl as MarketClient,
  QueryLeaseRequest,
  QueryLeasesRequest,
  QueryLeasesResponse,
} from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import {
  MsgCloseDeployment,
  MsgCreateDeployment,
  MsgDepositDeployment,
  MsgUpdateDeployment,
} from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deploymentmsg';
import { getMsgClient, getRpc } from '@akashnetwork/akashjs/build/rpc';
import { leaseEventsPath, leaseStatusPath, serviceLogsPath, submitManifestPath } from './paths';
import { KeplrWallet, rpcEndpoint } from '../atoms';
import {
  Lease,
  LeaseID,
  MsgCreateLease,
} from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease';
import { loadActiveCertificate, TLSCertificate } from './certificates';
import { mtlsFetch, proxyWSS } from './mtls';
import { getTypeUrl } from '@akashnetwork/akashjs/build/stargate';
import {
  DeploymentGroups,
  getCurrentHeight,
  Manifest,
  ManifestVersion,
} from '../../_helpers/deployments-utils';
import {
  Deployment
} from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { BidID } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/bid';
import { fetchRpcNodeStatus } from './rpc';
import { LeaseStatus } from '../../types';
import logging from '../../logging';
import { QueryFunction } from 'react-query';

// 5AKT aka 5000000uakt
export const defaultInitialDeposit = 5000000;

export const fetchDeployment = async (owner: string, dseq: string) => {
  const rpc = await getRpc(rpcEndpoint());
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

export const fetchDeploymentList: QueryFunction<
  QueryDeploymentsResponse,
  [string, { owner: string, state?: string, dseq?: string }]
> = async (
  params
) => {
  const [, { owner, state, dseq }] = params.queryKey;
  const pagination = {
    limit: 100,
  };
  const filters = {
    owner,
    state,
    dseq,
  };
  const deploymentCount = await fetchDeploymentCount({ owner: filters.owner }, rpcEndpoint());
  if (deploymentCount > 100) {
    pagination.limit = deploymentCount;
  }
  const rpc = await getRpc(rpcEndpoint());
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

export const fetchLeaseListActive: QueryFunction<
  QueryLeasesResponse,
  [string, { owner: string }]
>
  = async (params) => {
    const [, { owner }] = params.queryKey;
    const rpc = await getRpc(rpcEndpoint());
    const client = new MarketClient(rpc);

    return client.Leases(
      QueryLeasesRequest.fromPartial({
        filters: { owner, state: 'active' },
        pagination: { limit: 5000 },
      })
    );
  };

export const fetchLease = async (params: { owner: string, dseq: string }) => {
  const rpc = await getRpc(rpcEndpoint());
  const client = new MarketClient(rpc);

  return client.Leases(QueryLeasesRequest.fromPartial({ filters: params }));
};

export const fetchLeaseStatus = async (lease: Lease) => {
  const cert = await loadActiveCertificate();

  if (!lease || !lease.leaseId || cert.$type !== 'TLS Certificate') return;

  const leaseId = LeaseID.toJSON(lease.leaseId) as {
    dseq: string,
    gseq: string,
    oseq: string,
  };

  const url = leaseStatusPath(leaseId);
  const rpc = await getRpc(rpcEndpoint());
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
  deployment: Deployment,
  quantity: number
) {
  const { deploymentId } = deployment;
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;

  if (!signer || !deploymentId) return;

  const client = await getMsgClient(rpcEndpoint(), signer);
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

export async function closeDeployment(wallet: KeplrWallet, deployment: Deployment) {
  const { deploymentId } = deployment;
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;

  if (!signer || !deploymentId) return;

  const client = await getMsgClient(rpcEndpoint(), signer);
  const msg = {
    typeUrl: getTypeUrl(MsgCloseDeployment),
    value: MsgCloseDeployment.fromPartial({
      id: deploymentId,
    }),
  };

  return client.signAndBroadcast(account.address, [msg], 'auto', 'Close deployment');
}

export async function createDeployment(wallet: KeplrWallet, sdl: any, depositor: string | undefined = undefined) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;
  const status = await fetchRpcNodeStatus(rpcEndpoint());

  if (!signer) {
    return Promise.reject('Unable to initialize signing client');
  }

  const client = await getMsgClient(rpcEndpoint(), signer);

  const groups = DeploymentGroups(sdl);
  const ver = await ManifestVersion(sdl);

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

  return {
    deploymentId: {
      owner: account.address,
      dseq: status.sync_info.latest_block_height,
    },
    tx: await client.signAndBroadcast(account.address, [msg], 'auto', 'Creating the deployment'),
  };
}

export async function updateDeployment(wallet: KeplrWallet, deploymentId: any, sdl: any) {
  const [account] = wallet.accounts;
  const signer = wallet.offlineSigner;

  if (!signer) {
    return Promise.reject('Unable to initialize signing client');
  }

  const client = await getMsgClient(rpcEndpoint(), signer);
  const ver = await ManifestVersion(sdl);

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

  if (!signer || !bidId) return;

  const client = await getMsgClient(rpcEndpoint(), signer);
  const msg = {
    typeUrl: getTypeUrl(MsgCreateLease),
    value: MsgCreateLease.fromJSON({
      bidId,
    }),
  };

  return client.signAndBroadcast(account.address, [msg], 'auto', 'Create lease for deployment')
    .then(async () => {
      const rpc = await getRpc(rpcEndpoint());
      const queryClient = new MarketClient(rpc);
      const qmsg = QueryLeaseRequest.fromJSON({ id: bidId });

      return queryClient.Lease(qmsg)
        .then((response) => response.lease);
    });
}

export async function sendManifest(address: string, lease: Lease, sdl: any) {
  const obj: any = Lease.toJSON(lease);
  const dseq = `${lease?.leaseId?.dseq?.low}`;
  const url = submitManifestPath(dseq);
  const cert = await loadActiveCertificate(address);

  if (cert.$type !== 'TLS Certificate') {
    return Promise.reject('No certificate available');
  }

  const rpc = await getRpc(rpcEndpoint());
  const client = new ProviderClient(rpc);
  const request = QueryProviderRequest.fromPartial({
    owner: obj.leaseId.provider,
  });

  const provider: any = await client.Provider(request);
  const providerFetch = mtlsFetch(cert, provider.provider.hostUri);
  const manifest = Manifest(sdl, true);

  let jsonStr = JSON.stringify(manifest);

  jsonStr = jsonStr.replaceAll('"quantity":{"val', '"size":{"val');
  jsonStr = jsonStr.replaceAll('"mount":', '"readOnlyTmp":');
  jsonStr = jsonStr.replaceAll('"readOnly":', '"mount":');
  jsonStr = jsonStr.replaceAll('"readOnlyTmp":', '"readOnly":');

  return new Promise((resolve, reject) => {
    const attemptSend = (retry: number) => {
      return providerFetch(url, {
        method: 'PUT',
        body: jsonStr,
      }).then(result => {
        if (result.ok) {
          resolve(result);
          return;
        }

        if (retry > 0) {
          logging.warn('Sending manifest failed. Retrying...');
          setTimeout(() => attemptSend(retry - 1), 1000);
        } else {
          logging.warn('Sending manifest failed.');
          result.text().then(reject);
        }
      });
    };

    attemptSend(3);
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
  const groups = DeploymentGroups(yamlJson);
  const mani = Manifest(yamlJson);
  const ver = await ManifestVersion(yamlJson);
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
