import { proxyURL } from '../recoil/api/mtls';

export const [getRpcNode, setRpcNode] = (() => {
  let rpcNode = 'https://rpc.ny.akash.farm/token/TBWM93ZB';

  function get(proxy: Boolean = false): string {
    const rpcEndpointURL = new URL(rpcNode);

    return proxy
      ? `${proxyURL}upstream/${rpcEndpointURL.protocol.slice(0, -1)}/${rpcEndpointURL.hostname}/${rpcEndpointURL.port || "443"}${rpcEndpointURL.pathname}`
      : rpcNode;
  }

  function set(value: string): Promise<string> {
    rpcNode = value;
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
