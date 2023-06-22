import { atom, AtomEffect, RecoilLoadable } from 'recoil';
import pkg from '../../package.json';
import { loadActiveCertificate } from './api';

import { AccountData, CosmosClient, OfflineSigner } from '@cosmjs/launchpad';
import { proxyURL } from '../api/rest/mtls';
import fetchPriceAndMarketCap from './api/akt';
import { SDLSpec } from '../components/SdlConfiguration/settings';
import { getRpcNode } from '../hooks/useRpcNode';
import { debug } from 'console';

export interface KeplrWallet {
  accounts: AccountData[];
  offlineSigner?: OfflineSigner;
  cosmosClient?: CosmosClient;
  isSignedIn: boolean;
  file?: string;
}

// Deprecated. Use getRpcNode instead.
export const rpcEndpointBase = 'https://rpc.ny.akash.farm/token/TBWM93ZB';
export const rpcEndpointURL = new URL(rpcEndpointBase);
export const rpcProxyEndpoint = `${proxyURL}upstream/${rpcEndpointURL.protocol.slice(0, -1)}/${
  rpcEndpointURL.hostname
}/${rpcEndpointURL.port || '443'}${rpcEndpointURL.pathname}`;

// Located in this file for backwards compatibility
// TODO: Move to a more appropriate location
export const rpcEndpoint = getRpcNode;

export const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key: string) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);

    if (savedValue !== null && savedValue !== 'undefined') {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

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
    isSignedIn: JSON.parse(localStorage.walletConnected || 'false'),
    file: '',
  },
});

// TODO: Don't think this is used anymore. Validate and remove if so.
export const rpcState = atom({
  key: 'rpcState',
  default: {
    proxyEndpoint: rpcProxyEndpoint,
    currentRPC: '',
    rpcs: [],
  },
});

export const deploymentSdl = atom<SDLSpec | undefined>({
  key: 'DeploymentSDL',
  default: undefined,
  effects: [localStorageEffect('deployment_sdl')],
});

export const aktMarketCap = atom({
  key: 'AktMarketCap',
  default: RecoilLoadable.of(fetchPriceAndMarketCap()),
});

export const activeCertificate = atom({
  key: 'activeCertificate',
  default: RecoilLoadable.of(loadActiveCertificate()),
});

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

export const showKeplrWindow = atom({
  key: 'ShowKeplrWindow',
  default: false,
});

export const deploymentDataStale = atom({
  key: 'DeploymentDataStale',
  default: false,
});
