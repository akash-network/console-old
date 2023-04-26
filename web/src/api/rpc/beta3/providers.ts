import {
  QueryClientImpl as ProviderClient,
  QueryProviderRequest,
  QueryProvidersRequest,
} from '@akashnetwork/akashjs/build/protobuf/akash/provider/v1beta2/query';
import {
  QueryAuditorAttributesRequest,
  QueryClientImpl as AuditClient,
  QueryProviderAttributesRequest,
  QueryProvidersResponse,
} from '@akashnetwork/akashjs/build/protobuf/akash/audit/v1beta2/query';
import { getRpc } from '@akashnetwork/akashjs/build/rpc';

export const fetchProvidersList = async (rpcEndpoint: string) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new ProviderClient(rpc);

  return client.Providers(QueryProvidersRequest.fromPartial({}));
};

export const fetchProviderInfo = async (
  filter: {
    owner: string;
  },
  rpcEndpoint: string
) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new ProviderClient(rpc);

  return client.Provider(QueryProviderRequest.fromPartial(filter));
};

export const fetchProviderAttributes = async (
  filter: {
    owner: string;
  },
  rpcEndpoint: string
) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new AuditClient(rpc);

  if (filter.owner === undefined) {
    return;
  }

  return client
    .ProviderAttributes(QueryProviderAttributesRequest.fromPartial(filter))
    .catch((err) => ({} as QueryProvidersResponse)); // if there is no value, return empty set
};

export const fetchAuditorAttributes = async (
  filter: {
    auditor: string;
  },
  rpcEndpoint: string
) => {
  const rpc = await getRpc(rpcEndpoint);
  const client = new AuditClient(rpc);

  if (filter.auditor === undefined) {
    return;
  }

  return client
    .AuditorAttributes(QueryAuditorAttributesRequest.fromPartial(filter))
    .catch((err) => ({} as QueryProvidersResponse)); // if there is no value, return empty set
};
