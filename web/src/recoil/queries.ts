import { QueryFunction, QueryFunctionContext } from "react-query";
import { fetchCertificates, fetchDeployment, fetchLeaseStatus } from "./api";
import { rpcEndpoint } from "./atoms";
import { fetchAuditorAttributes, fetchProviderAttributes, fetchProviderInfo, fetchProvidersList } from "./api/providers";
import { fetchRpcNodeStatus } from "./api/rpc";
import { Lease } from "@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease";

function createQueryFunction<T, R>(fn: (args: T) => Promise<R>): QueryFunction<R, [string, T]> {
  return (context: QueryFunctionContext<[string, T]>) => {
    const { queryKey: [, args] } = context;
    return fn(args);
  };
}

export const queryCertificates = createQueryFunction((owner: string | undefined) => {
  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchCertificates({ owner }, rpcEndpoint());
});

export const queryProviders = createQueryFunction(() => {
  return fetchProvidersList(rpcEndpoint());
});

export const queryProviderInfo = createQueryFunction((owner: string) => {
  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchProviderInfo({ owner }, rpcEndpoint());
});

export const queryProviderAttributes = createQueryFunction((owner: string) => {
  if (owner === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchProviderAttributes({ owner }, rpcEndpoint());
});

export const queryAuditorAttributes = createQueryFunction((auditor: string) => {
  if (auditor === undefined) {
    return Promise.resolve(undefined);
  }

  return fetchAuditorAttributes({ auditor }, rpcEndpoint());
});

export const queryRpcNodeStatus = createQueryFunction(() => {
  return fetchRpcNodeStatus(rpcEndpoint());
});

export const deploymentInfo = createQueryFunction((deploymentId: { owner: string, dseq: string }) => {
  if (!deploymentId?.owner || !deploymentId?.dseq) {
    return Promise.resolve(undefined);
  }

  return fetchDeployment(deploymentId.owner, deploymentId.dseq);
});

export const leaseStatus = createQueryFunction((leaseId: Lease) => {
  if (!leaseId) {
    return Promise.resolve(undefined);
  }

  return fetchLeaseStatus(leaseId);
});
