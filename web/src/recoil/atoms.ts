import { atom, AtomEffect, atomFamily, RecoilLoadable } from 'recoil';
import pkg from '../../package.json';
import {
  fetchCertificates,
  fetchDeployment,
  fetchLeaseStatus,
  loadActiveCertificate,
} from './api';

import { AccountData, CosmosClient, OfflineSigner } from '@cosmjs/launchpad';
import { fetchRpcNodeStatus } from './api/rpc';
import { proxyURL } from './api/mtls';
import {
  fetchAuditorAttributes,
  fetchProviderAttributes,
  fetchProviderInfo,
  fetchProvidersList,
} from './api/providers';
import fetchPriceAndMarketCap from './api/akt';
import { SDLSpec } from '../components/SdlConfiguration/settings';

export interface KeplrWallet {
  accounts: AccountData[];
  offlineSigner?: OfflineSigner;
  cosmosClient?: CosmosClient;
  isSignedIn: boolean;
  file?: string;
}

export const rpcEndpointBase = 'https://rpc.ny.akash.farm/token/TBWM93ZB';
export const rpcEndpointURL = new URL(rpcEndpointBase);
export const rpcProxyEndpoint = (
  `${proxyURL}upstream/${rpcEndpointURL.protocol.slice(0, -1)}/${rpcEndpointURL.hostname}/${rpcEndpointURL.port || "443"}${rpcEndpointURL.pathname}`
);
export const rpcEndpoint = rpcEndpointBase;

console.log(rpcEndpointURL)

export const appVersion = atom({
  key: 'appVersion',
  default: pkg.version,
});

export const keplrState = atom<KeplrWallet>({
  key: 'keplrState',
  default: {
    accounts: [] as AccountData[],
    offlineSigner: undefined,
    cosmosClient: undefined,
    isSignedIn: JSON.parse(localStorage.walletConnected || "false"),
    file: '',
  },
});

export const rpcState = atom({
  key: 'rpcState',
  default: {
    proxyEndpoint: rpcProxyEndpoint,
    currentRPC: '',
    rpcs: [],
  },
});

export const deploymentInfo = atomFamily({
  key: 'DeploymentInfo',
  default: (deploymentId: { owner: string; dseq: string }) =>
    RecoilLoadable.of(fetchDeployment(deploymentId.owner, deploymentId.dseq)),
});

export const leaseStatus = atomFamily({
  key: 'LeaseStatus',
  default: (params: string) => {
    const { leaseId, certificate } = JSON.parse(params);
    return RecoilLoadable.of(fetchLeaseStatus(leaseId, certificate));
  },
});

export const providerList = atomFamily({
  key: 'Providers',
  default: () => RecoilLoadable.of(fetchProvidersList(rpcEndpoint)),
});

export const providerInfo = atomFamily({
  key: 'ProviderInfo',
  default: (owner: string) => RecoilLoadable.of(fetchProviderInfo({ owner }, rpcEndpoint)),
});

export const certificateList = atomFamily({
  key: 'Certificates',
  default: (owner: string) => RecoilLoadable.of(fetchCertificates({ owner }, rpcEndpoint)),
});

export const rpcNodeStatus = atom({
  key: 'RpcNodeStatus',
  default: RecoilLoadable.of(fetchRpcNodeStatus(rpcEndpoint)),
});

export const deploymentSdl = atom<SDLSpec | undefined>({
  key: 'DeploymentSDL',
  default: undefined,
});

export const aktMarketCap = atom({
  key: 'AktMarketCap',
  default: RecoilLoadable.of(fetchPriceAndMarketCap()),
});

export const activeCertificate = atom({
  key: 'activeCertificate',
  default: RecoilLoadable.of(loadActiveCertificate()),
});

export const localStorageEffect: <T>(key: string) => AtomEffect<T>
  = (key: string) =>
    ({ setSelf, onSet }) => {
      const savedValue = localStorage.getItem(key);
      if (savedValue !== null) {
        setSelf(JSON.parse(savedValue));
      }

      onSet((newValue, _, isReset) => {
        isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
      });
    };

export const optIntoAnalytics = atom<boolean>({
  key: 'optIntoAnalytics',
  default: true,
  effects: [localStorageEffect('opt_into_analytics')],
});

export const myDeployments = atom({
  key: 'myDeployments',
  default: {},
  effects: [localStorageEffect('my_deployments')],
});

export const providerAttributes = atomFamily({
  key: 'providerAttributes',
  default: (owner: string) => RecoilLoadable.of(fetchProviderAttributes({ owner }, rpcEndpoint)),
});

export const auditorAttributes = atomFamily({
  key: 'auditorAttributes',
  default: (auditor: string) => RecoilLoadable.of(fetchAuditorAttributes({ auditor }, rpcEndpoint)),
});

export const showKeplrWindow = atom({
  key: 'ShowKeplrWindow',
  default: false
})

export const deploymentDataStale = atom({
  key: 'DeploymentDataStale',
  default: false
})