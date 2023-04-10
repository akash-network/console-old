import { useRecoilState } from 'recoil';
import * as atoms from '../atoms';

export * from './deployments';
export * from './certificates';

// const setRPC = async (props?: { rpc: any }) => {
//   const [rpcState, setRPCState] = useRecoilState(atoms.rpcState);
//   const _rpcState = {
//     ...rpcState,
//     proxyEndpoint: '',
//     currentRPC: '',
//     rpcs: [...rpcState.rpcs, props?.rpc],
//   };
//   setRPCState(_rpcState as any);
// };
