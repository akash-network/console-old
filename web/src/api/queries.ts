import { QueryFunction, QueryFunctionContext } from 'react-query';

import * as beta2 from './rpc/beta2';
import * as beta3 from './rpc/beta3';

import { Lease } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease';
import { getRpcNode } from '../hooks/useRpcNode';

import { QueryCertificatesResponse as Beta2CertificateResponse } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/query';
import { QueryCertificatesResponse as Beta3CertificateResponse } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta3/query';

import { QueryDeploymentResponse as Beta2DeploymentResponse } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/query';
import { QueryDeploymentResponse as Beta3DeploymentResponse } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta3/query';

import { QueryLeasesResponse as Beta2LeasesResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import { QueryLeasesResponse as Beta3LeasesResponse } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/query';

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

  return fetchMethod(rpcNode);
});

export const queryProviderInfo = createQueryFunction((owner: string) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchProviderInfo
      : beta2.providers.fetchProviderInfo;

  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchMethod({ owner }, rpcNode);
});

export const queryProviderAttributes = createQueryFunction((owner: string) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchProviderAttributes
      : beta2.providers.fetchProviderAttributes;

  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchMethod({ owner }, rpcNode);
});

export const queryAuditorAttributes = createQueryFunction((auditor: string) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.providers.fetchAuditorAttributes
      : beta2.providers.fetchAuditorAttributes;

  if (auditor === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchMethod({ auditor }, rpcNode);
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

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.deployments.fetchDeployment
      : beta2.deployments.fetchDeployment;

  if (!deploymentId?.owner || !deploymentId?.dseq) {
    return Promise.resolve(undefined);
  }

  return fetchMethod(deploymentId.owner, deploymentId.dseq, rpcNode);
});

export const leaseStatus = createQueryFunction((leaseId: Lease) => {
  const { networkType, rpcNode } = getRpcNode();

  const fetchMethod =
    networkType === 'testnet'
      ? beta3.deployments.fetchLeaseStatus
      : beta2.deployments.fetchLeaseStatus;

  if (!leaseId) {
    return Promise.resolve(undefined);
  }

  return fetchMethod((leaseId as any), rpcNode);
});
