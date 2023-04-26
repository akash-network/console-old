import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '../../components/errors';
import axios from 'axios';

export const BaseAtomComponent = (props?: any) => {
  const [stateData, setStateData] = useState([]);
  // const [rpcState] = useRecoilState(atoms.rpcState);
  // const { proxyEndpoint } = rpcState;

  useEffect(() => {
    (async () => {
      const res: any = await axios.get(
        'http://localhost:4040/api/deployments/list?address=akash1g2824089yrnlfzg0fns2t0t8lgzy47ck7t60hg'
      );
      setStateData(res.data);
    })();
  }, []);

  return (
    <ErrorBoundary>
      {props?.children ? React.cloneElement(props.children, { data: stateData }) : null}
    </ErrorBoundary>
  );
};
