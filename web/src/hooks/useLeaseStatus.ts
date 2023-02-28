import { useRecoilValue } from 'recoil';
import { Lease } from "@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/lease";
import { activeCertificate, rpcEndpoint } from "../recoil/atoms";
import { useCallback, useEffect, useState } from 'react';
import {
  QueryProviderResponse
} from '@akashnetwork/akashjs/build/protobuf/akash/provider/v1beta2/query';
import { fetchProviderInfo } from '../recoil/api/providers';
import { mtlsFetch } from '../recoil/api/mtls';
import { leaseStatusPath } from '../recoil/api/paths';

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
    }
  }
}

type ProviderInfo = QueryProviderResponse["provider"];

export function useLeaseStatus(lease: Lease) {
  const [leaseStatusState, setLeaseStatus] = useState<LeaseStatus>();
  const [providerInfoState, setProviderInfo] = useState<ProviderInfo>();
  const certificate = useRecoilValue(activeCertificate);

  const refreshLeaseStatus = useCallback(() => {
    if (!providerInfoState || !lease || certificate.$type === 'Invalid Certificate') {
      return;
    }

    const { hostUri } = providerInfoState;
    const url = leaseStatusPath(lease.leaseId as any);
    const providerFetch = mtlsFetch(certificate, hostUri);

    providerFetch(url)
      .then(
        (response) => response.json(),
        (err) => {
          console.error(err);
          setTimeout(refreshLeaseStatus, 5000);
        }
      )
      .then((data) => setLeaseStatus(data as LeaseStatus))
  }, [providerInfoState, certificate, lease])

  useEffect(() => {
    if (lease?.leaseId) {
      const { provider } = lease.leaseId;

      fetchProviderInfo({ owner: provider }, rpcEndpoint)
        .then(response => setProviderInfo(response?.provider));
    }
  }, [lease])

  useEffect(() => {
    refreshLeaseStatus();
  }, [refreshLeaseStatus]);

  return leaseStatusState;
}