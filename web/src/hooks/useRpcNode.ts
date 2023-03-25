import { proxyURL } from '../recoil/api/mtls';

const storageKey = 'rpc_endpoint';
const defaultRpcNode = 'https://rpc.ny.akash.farm/token/TBWM93ZB';

function getRpcFromStorageOrDefault(defaultValue: string) {
  const raw = localStorage.getItem(storageKey);
  return raw ? raw : defaultValue;
}

function saveRpcToStorage(rpcNode: string) {
  localStorage.setItem(storageKey, rpcNode);
}

function deleteRpcFromStorage() {
  localStorage.removeItem(storageKey);
}

export const [getRpcNode, setRpcNode] = (() => {
  let rpcNode = getRpcFromStorageOrDefault(defaultRpcNode);

  function get(proxy: Boolean = false): string {
    const rpcEndpointURL = new URL(rpcNode);

    return proxy
      ? `${proxyURL}upstream/${rpcEndpointURL.protocol.slice(0, -1)}/${rpcEndpointURL.hostname}/${rpcEndpointURL.port || "443"}${rpcEndpointURL.pathname}`
      : rpcNode;
  }

  function set(value: string): Promise<string> {
    rpcNode = value;
    saveRpcToStorage(rpcNode);
    return Promise.resolve(rpcNode);
  }

  return [get, set];
})();

export function useRpcNode() {
  return [
    getRpcNode,
    setRpcNode
  ] as [typeof getRpcNode, typeof setRpcNode];
}
