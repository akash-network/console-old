import { proxyURL } from '../api/rest/mtls';

const storageKey = 'rpc_settings';

export const defaultRpcSettings = {
  rpcNode: 'https://rpc.akashnet.net/',
  chainId: 'akashnet-2',
  networkType: 'testnet',
};

export const testnetRpcSettings = {
  rpcNode: 'https://rpc.testnet-02.aksh.pw/',
  chainId: 'testnet-2',
  networkType: 'testnet',
};

export const sandboxRpcSettings = {
  rpcNode: 'https://rpc.sandbox-01.aksh.pw/',
  chainId: 'akashnet-2',
  networkType: 'testnet',
};

export type RpcSettings = typeof defaultRpcSettings;

function isRpcSettings(value: unknown): value is RpcSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { rpcNode, chainId, networkType } = value as Record<string, unknown>;

  return (
    typeof rpcNode === 'string' &&
    typeof chainId === 'string' &&
    typeof networkType === 'string'
  );
}

function hasNetworkUpgraded(settings: RpcSettings) {
  const config = [defaultRpcSettings, testnetRpcSettings, sandboxRpcSettings]
    .find((config) => config.chainId === settings.chainId);

  return config ? config.networkType !== settings.networkType : false;
}

function getRpcFromStorageOrDefault(defaultValue: RpcSettings) {
  const raw = localStorage.getItem(storageKey);

  try {
    if (raw) {
      const parsed = raw ? JSON.parse(raw) : null;

      if (parsed) {
        if (hasNetworkUpgraded(parsed)) {
          console.warn('Network has been upgraded. Resetting RPC settings.');
          deleteRpcFromStorage();
          return defaultValue;
        }

        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse RPC settings from local storage', e);
  }

  return defaultValue;
}

function saveRpcToStorage(settings: RpcSettings) {
  if (!isRpcSettings(settings)) {
    console.warn('Failed to save RPC settings to local storage. Invalid object.', settings);
  }

  const value = JSON.stringify(settings);
  localStorage.setItem(storageKey, value);
}

function deleteRpcFromStorage() {
  localStorage.removeItem(storageKey);
}

export const [getRpcNode, setRpcNode] = (() => {
  const settings = getRpcFromStorageOrDefault(defaultRpcSettings);

  function get(proxy = false): RpcSettings {
    const rpcEndpointURL = new URL(settings.rpcNode);
    const url = proxy
      ? `${proxyURL}upstream/${rpcEndpointURL.protocol.slice(0, -1)}/${rpcEndpointURL.hostname}/${rpcEndpointURL.port || '443'
      }${rpcEndpointURL.pathname}`
      : settings.rpcNode;

    return { ...settings, rpcNode: url };
  }

  function set(value: RpcSettings): Promise<RpcSettings> {
    saveRpcToStorage(value);
    return Promise.resolve(value);
  }

  return [get, set];
})();

export function useRpcNode() {
  return [getRpcNode, setRpcNode] as [typeof getRpcNode, typeof setRpcNode];
}
