import { QueryFunction, QueryFunctionContext } from 'react-query';

import * as beta2 from './rpc/beta2';
import * as beta3 from './rpc/beta3';

import { getRpcNode } from '../hooks/useRpcNode';

import { QueryCertificatesResponse as Beta2CertificateResponse } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/query';
import { QueryCertificatesResponse as Beta3CertificateResponse } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta3/query';

import { QueryDeploymentResponse as Beta2DeploymentResponse } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/query';
import { QueryDeploymentResponse as Beta3DeploymentResponse } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta3/query';

import { QueryLeasesResponse as Beta2LeasesResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import { QueryLeasesResponse as Beta3LeasesResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/query';

import { QueryBidsResponse as Beta2QueryBidsResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import { QueryBidsResponse as Beta3QueryBidsResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/query';

function createQueryFunction<T, R>(fn: (args: T) => Promise<R>): QueryFunction<R, [string, T]> {
  return (context: QueryFunctionContext<[string, T]>) => {
    const {
      queryKey: [, args],
    } = context;
    return fn(args);
  };
}

export const queryCertificates = createQueryFunction<
  string | undefined,
  Beta2CertificateResponse | Beta3CertificateResponse | undefined
>((owner: string | undefined) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.certificates.fetchCertificates
      : beta2.certificates.fetchCertificates;

  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchMethod({ owner }, rpcNode);
});

export const queryProviders = createQueryFunction(() => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchProvidersList
      : beta2.providers.fetchProvidersList;


  const ret = fetchMethod(rpcNode);

  // Forces the various returns into a single Promise
  // to keep createQueryFunction happy.
  return Promise.any([ret]);
});

export const queryProviderInfo = createQueryFunction((owner: string | undefined) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchProviderInfo
      : beta2.providers.fetchProviderInfo;

  if (owner === undefined) {
    return Promise.reject(new Error('No owner provided'));
  }

  return fetchMethod({ owner }, rpcNode)
    .then(result => result);
});

export const queryProviderAttributes = createQueryFunction((owner: string) => {
  const { networkType, rpcNode } = getRpcNode();
  let ret = null;

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchProviderAttributes
      : beta2.providers.fetchProviderAttributes;

  if (owner === undefined) {
    ret = Promise.resolve(undefined);
  } else {
    ret = fetchMethod({ owner }, rpcNode);
  }

  return Promise.any([ret]);
});

export const queryAuditorAttributes = createQueryFunction((auditor: string) => {
  const { networkType, rpcNode } = getRpcNode();
  let ret = null;

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchAuditorAttributes
      : beta2.providers.fetchAuditorAttributes;

  if (auditor === undefined) {
    ret = Promise.resolve(undefined);
  } else {
    ret = fetchMethod({ auditor }, rpcNode);
  }

  return Promise.any([ret]);
});

export const queryRpcNodeStatus = createQueryFunction(() => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.rpc.fetchRpcNodeStatus
      : beta2.rpc.fetchRpcNodeStatus;

  return fetchMethod(rpcNode);
});

type DeploymentInfoResponse = {
  deployment: Beta2DeploymentResponse | Beta3DeploymentResponse,
  leases: Beta2LeasesResponse | Beta3LeasesResponse,
};

export const deploymentInfo = createQueryFunction<
  { owner: string; dseq: string },
  DeploymentInfoResponse | undefined
>((deploymentId: { owner: string; dseq: string }) => {
  const { networkType, rpcNode } = getRpcNode();
  let ret = null;

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.deployments.fetchDeployment
      : beta2.deployments.fetchDeployment;

  if (!deploymentId?.owner || !deploymentId?.dseq) {
    ret = Promise.resolve(undefined);
  } else {
    ret = fetchMethod(deploymentId.owner, deploymentId.dseq, rpcNode);
  }

  return Promise.any([ret]);
});

export const leaseStatus = createQueryFunction((leaseId: any) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.deployments.fetchLeaseStatus
      : beta2.deployments.fetchLeaseStatus;

  if (!leaseId) {
    return Promise.resolve(undefined);
  }

  return fetchMethod(leaseId, rpcNode);
});

export const queryBidsList = createQueryFunction<
  { owner: string; dseq: string },
  Beta2QueryBidsResponse | Beta3QueryBidsResponse | undefined
>(({ owner, dseq }: { owner: string, dseq: string }) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.deployments.fetchBidsList
      : beta2.deployments.fetchBidsList;

  if (!owner || !dseq) {
    return Promise.resolve(undefined);
  }

  return fetchMethod({ owner, dseq }, rpcNode);
});

export const queryDeploymentList = createQueryFunction(
  ({ owner, state }: { owner: string; state?: string }) => {
    const { networkType, rpcNode } = getRpcNode();
    let ret = null;

    const fetchMethod =
      networkType === 'testnet'
        ? beta3.deployments.fetchDeploymentList
        : beta2.deployments.fetchDeploymentList;

    if (!owner) {
      ret = Promise.resolve(undefined);
    } else {
      ret = fetchMethod({ owner, state }, rpcNode);
    }

    // Forces the various returns into a single Promise
    // to keep createQueryFunction happy.
    return Promise.any([ret]);
  });

export const queryLease = createQueryFunction(
  ({ owner, dseq }: { owner: string; dseq: string }) => {
    const { networkType } = getRpcNode();
    let ret = null;

    const fetchMethod =
      networkType === 'testnet'
        ? beta3.deployments.fetchLease
        : beta2.deployments.fetchLease;

    if (!owner) {
      ret = Promise.resolve(undefined);
    } else {
      ret = fetchMethod({ owner, dseq });
    }

    // Forces the various returns into a single Promise
    // to keep createQueryFunction happy.
    return Promise.any([ret]);
  }
);

export const queryLeaseList = createQueryFunction(
  ({ owner }: { owner: string }) => {
    const { networkType } = getRpcNode();
    let ret = null;

    const fetchMethod =
      networkType === 'testnet'
        ? beta3.deployments.fetchLeaseListActive
        : beta2.deployments.fetchLeaseListActive;

    if (!owner) {
      ret = Promise.resolve(undefined);
    } else {
      ret = fetchMethod({ owner });
    }

    // Forces the various returns into a single Promise
    // to keep createQueryFunction happy.
    return Promise.any([ret]);
  }
);
