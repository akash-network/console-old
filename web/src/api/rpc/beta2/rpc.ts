import { statusPath } from '../../rest/beta2/paths';

export interface RpcNodeStatus {
  node_info: {
    protocol_version: {
      p2p: string;
      block: string;
      app: string;
    };
    id: string;
    listen_addr: string;
    network: string;
    version: string;
    channels: string;
    moniker: string;
    other: {
      tx_index: string;
      rpc_address: string;
    };
  };
  sync_info: {
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: string;
    latest_block_time: string;
    earliest_block_hash: string;
    earliest_app_hash: string;
    earliest_block_height: string;
    earliest_block_time: string;
    catching_up: false;
  };
  validator_info: {
    address: string;
    pub_key: {
      type: string;
      value: string;
    };
    voting_power: string;
  };
}

type NodeInfo = RpcNodeStatus['node_info'];
type SyncInfo = RpcNodeStatus['sync_info'];
type ValidatorInfo = RpcNodeStatus['validator_info'];

export function isNodeInfo(value: unknown): value is NodeInfo {
  return (
    typeof value === 'object' && value !== null &&
    typeof (value as NodeInfo).protocol_version === 'object' &&
    typeof (value as NodeInfo).id === 'string' &&
    typeof (value as NodeInfo).listen_addr === 'string' &&
    typeof (value as NodeInfo).network === 'string' &&
    typeof (value as NodeInfo).version === 'string' &&
    typeof (value as NodeInfo).channels === 'string' &&
    typeof (value as NodeInfo).moniker === 'string' &&
    typeof (value as NodeInfo).other === 'object'
  );
}

export function isSyncInfo(value: unknown): value is SyncInfo {
  return (
    typeof value === 'object' && value !== null &&
    typeof (value as SyncInfo).latest_block_hash === 'string' &&
    typeof (value as SyncInfo).latest_app_hash === 'string' &&
    typeof (value as SyncInfo).latest_block_height === 'string' &&
    typeof (value as SyncInfo).latest_block_time === 'string' &&
    typeof (value as SyncInfo).catching_up === 'boolean'
  );
}

export function isValidatorInfo(value: unknown): value is ValidatorInfo {
  return (
    typeof value === 'object' && value !== null &&
    typeof (value as ValidatorInfo).address === 'string' &&
    typeof (value as ValidatorInfo).pub_key === 'object' &&
    typeof (value as ValidatorInfo).voting_power === 'string'
  );
}

export function isRpcNodeStatus(value: unknown): value is RpcNodeStatus {
  return (
    typeof value === 'object' && value !== null &&
    isNodeInfo((value as RpcNodeStatus).node_info) &&
    isSyncInfo((value as RpcNodeStatus).sync_info) &&
    isValidatorInfo((value as RpcNodeStatus).validator_info)
  );
}

export function fetchRpcNodeStatus(endpoint: string) {
  const url = [endpoint, statusPath()].join('/');

  return fetch(url)
    .then((response) => response.json())
    .then((data) => data.result as RpcNodeStatus);
}
