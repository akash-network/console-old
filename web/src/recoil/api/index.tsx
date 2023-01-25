import { useRecoilState } from "recoil";
import * as atoms from "../atoms";

export * from "./deployments";
export * from "./certificates";

export const setRPC = async (props?: { rpc: any }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [rpcState, setRPCState] = useRecoilState(atoms.rpcState);
  const _rpcState = {
    ...rpcState,
    proxyEndpoint: "",
    currentRPC: "",
    rpcs: [...rpcState.rpcs, props?.rpc],
  };
  setRPCState(_rpcState as any);
};
