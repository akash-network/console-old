import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Long from 'long';
import { queryDeploymentList, queryLeaseList } from '../api/queries';
import { queryLeaseStatus } from '../api/rest/lease';
import { activeCertificate, aktMarketCap, deploymentDataStale, keplrState, rpcEndpoint } from '../recoil/atoms';
import { useQuery } from 'react-query';
import { leaseCalculator } from '../_helpers/lease-calculations';
import { uniqueName } from '../_helpers/unique-name';
import { fetchLeaseStatus } from '../api/rpc/beta2/deployments';
import { getRpcNode } from './useRpcNode';

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
    (lease: any) => {
      if (certificate.$type === 'TLS Certificate') {
        return lease && fetchLeaseStatus(lease, rpcEndpoint);
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
          const status = await getLeaseStatus(lease);
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

          const appCache = dseq ? localStorage.getItem(dseq) : null;

          const application = appCache ? JSON.parse(appCache) : null;

          if (application !== null && application.name !== '') {
            name = application.name;
          } else {
            name = uniqueName(keplr?.accounts[0]?.address, dseq);
          }
          if (status && status.services) {
            url = Object.values(status.services)
              .map((service) => (service as any).uris[0])
              .join(', ');
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
    ).then(setDeploymentsData);
  }, [status, deploymentsQuery, getDeploymentLease, getLeaseStatus]);

  return deploymentsData;
}
