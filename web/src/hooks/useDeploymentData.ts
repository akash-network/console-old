import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Long from 'long';
import { queryDeploymentList, queryLeaseList, queryProviderInfo } from '../api/queries';
import { queryLeaseStatus } from '../api/rest/lease';
import { activeCertificate, aktMarketCap, deploymentDataStale, keplrState, rpcEndpoint } from '../recoil/atoms';
import { useQuery } from 'react-query';
import { leaseCalculator } from '../_helpers/lease-calculations';
import { uniqueName } from '../_helpers/unique-name';
import { getRpcNode } from './useRpcNode';
import { fetchProviderInfo } from '../api/rpc/beta3/providers';
import { LeaseID } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/lease';

interface DeploymentData {
  name: string;
  url: string;
  lease: any;
  status: number;
  updatable: number;
  dseq: string;
}

export default function useDeploymentData(owner: string) {
  const { rpcNode: rpcEndpoint } = getRpcNode();
  const akt = useRecoilValue(aktMarketCap);
  const keplr = useRecoilValue(keplrState);
  const [deploymentsData, setDeploymentsData] = useState<Array<DeploymentData>>();

  const { status, data: deploymentsQuery } = useQuery(
    ['deployments', { owner }],
    queryDeploymentList,
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const { data: leasesQuery } = useQuery(['leases', { owner }], queryLeaseList, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const [deploymentsStale, setDeploymentsStale] = useRecoilState(deploymentDataStale);

  const certificate = useRecoilValue(activeCertificate);
  // const [providers, setProviders] = useRecoilState(providerList()); // TODO: cache providers to avoid multiple lookups

  // Bust the leases out of their query containers
  const leases = useMemo(() => leasesQuery?.leases.map((lease) => lease.lease), [leasesQuery]);

  // Setup some memoized callbacks to avoid redundant queries
  const getDeploymentLease = useCallback(
    (deployment: any) => {
      if (deployment.state !== 1 || !leases) return;

      return leases.find((lease) => {
        return lease?.leaseId?.dseq.toString() === deployment.deploymentId.dseq.toString();
      });
    },
    [leases]
  );

  // Would be good to cache the provider info an pass in here to reduce RPC calls
  const getLeaseStatus = useCallback(
    async (lease: any) => {
      if (certificate.$type === 'TLS Certificate' && lease !== undefined) {
        // TODO - this is using the beta3 fetch directly. This should be passing through
        // some type of abstraction layer to handle future changes to the API
        const providerInfo = await fetchProviderInfo({ owner: lease.leaseId?.provider }, rpcEndpoint);
        const providerUrl = providerInfo?.provider?.hostUri;

        // monkey patch the leaseId to avoid [object Object]
        lease.leaseId.dseq = Long.fromValue(lease.leaseId.dseq);

        return providerUrl && queryLeaseStatus(LeaseID.toJSON(lease.leaseId) as any, providerUrl);
      }
    },
    [certificate]
  );

  useEffect(() => {
    // avoid showing stale data if a deployment has been created or deleted
    if (status === 'loading' && deploymentsStale) {
      return;
    }

    if (!deploymentsQuery) {
      return;
    }

    if (status === 'success' && deploymentsStale) {
      setDeploymentsStale(false);
    }

    // Map it all together, and your mother's brother is named Robert
    Promise.all(
      deploymentsQuery.deployments
        .map(async (query) => {
          let name = '';
          let url = '';
          const lease = getDeploymentLease(query.deployment);
          const leaseInfo = leaseCalculator(
            query?.deployment as any,
            query?.escrowAccount as any,
            lease as any,
            akt?.current_price || 0
          );
          let updatable = 0;
          // Doing this cause dseq sometimes comes as plain object and not Long type,
          // and if that happen can't crate dseq string
          const dseq = new Long(
            query.deployment?.deploymentId?.dseq?.low || 0,
            query.deployment?.deploymentId?.dseq?.high,
            query.deployment?.deploymentId?.dseq?.unsigned
          )?.toString();

          let appCache = null;
          let application = null;

          try {
            appCache = dseq ? localStorage.getItem(dseq) : null;
            application = appCache ? JSON.parse(appCache) : null;
          } catch (e) {
            console.warn('Unable to parse application cache', e);
          }

          if (application !== null && application.name !== '') {
            name = application.name;
          } else {
            name = uniqueName(keplr?.accounts[0]?.address, dseq);
          }

          if (query.deployment?.state === 1) {
            const status = await getLeaseStatus(lease);

            if (status === undefined || status === '') {
              console.warn('Unable to resolve lease status for deployment:', dseq);
            } else {
              const leaseStatus = await status.json() as any;

              if (leaseStatus && leaseStatus.services) {
                url = Object.values(leaseStatus.services)
                  .map((service) => (service as any).uris)
                  .filter((uri) => uri && uri[0])
                  .map((uri) => uri[0])
                  .join(', ');
              }
            }
          }

          if (application !== null && query.deployment?.state === 1 && application.sdl !== undefined) {
            updatable = 1;
          } else {
            updatable = 0;
          }
          // Table row object
          return {
            name,
            dseq,
            url,
            lease: leaseInfo
              ? `Time Left: ${leaseInfo ? leaseInfo.timeLeft : 'N/A'}`
              : 'Time Left: 0 days',
            status: query.deployment?.state || 0,
            updatable: updatable,
          };
        })
    )
      .then(data => data.filter((item) => item !== undefined))
      .then(data => setDeploymentsData(data));
  }, [status, deploymentsQuery, getDeploymentLease, getLeaseStatus]);

  return deploymentsData;
}
