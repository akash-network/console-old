import { useRecoilValue } from 'recoil';
import { Lease, LeaseID } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease';
import { activeCertificate, rpcEndpoint } from '../recoil/atoms';
import { useCallback, useEffect, useState } from 'react';
import { QueryProviderResponse } from '@akashnetwork/akashjs/build/protobuf/akash/provider/v1beta2/query';
import { mtlsFetch } from '../api/rest/mtls';
import { leaseStatusPath } from '../recoil/api/paths';
import { getRpcNode } from './useRpcNode';
import { queryProviderInfo } from '../api/queries';
import { useQuery } from 'react-query';
import { queryLeaseStatus } from '../api/rest/lease';

interface LeaseStatus {
  services: {
    [service: string]: {
      name: string;
      available: number;
      total: number;
      uris: Array<string>;
      observed_generation: number;
      replicas: number;
      updated_replicas: number;
      ready_replicas: number;
      available_replicas: number;
    };
  };
}

export function useLeaseStatus(lease: Lease) {
  const certificate = useRecoilValue(activeCertificate);

  const { data: providerInfo } = useQuery(['providerInfo', lease?.leaseId?.provider], queryProviderInfo);

  const { data: leaseStatus } = useQuery(['leaseStatus', lease?.leaseId], () => {
    const leaseId = lease?.leaseId;
    const hostUri = providerInfo?.provider?.hostUri;

    if (hostUri && leaseId && certificate.$type !== 'Invalid Certificate') {
      return queryLeaseStatus(LeaseID.toJSON(leaseId) as any, hostUri)
        .then(response => response.json())
        .then(response => response as LeaseStatus);
    }

    return Promise.reject('No lease status available');
  });

  return leaseStatus;
}
