import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Checkbox from '@mui/material/Checkbox';
import { useQuery } from 'react-query';
import { queryProviderInfo } from '../../api/queries';

import { watchLeaseLogs as watchLeaseLogsBeta2 } from '../../api/rpc/beta2/deployments';
import { watchLeaseLogs as watchLeaseLogsBeta3 } from '../../api/rpc/beta3/deployments';

import { getRpcNode } from '../../hooks/useRpcNode';

export const Logs: React.FC<any> = ({ lease }) => {
  const { networkType } = getRpcNode();
  const { data: provider } = useQuery(
    ['providerInfo', lease?.lease?.leaseId?.provider],
    queryProviderInfo
  );
  const address = (lease as any).lease?.leaseId?.owner;
  const [logs, setLogs] = useState<any[]>([]);
  const [autoScrollWithOutput, setAutoScrollWithOutput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let socket: null | WebSocket = null;

    if (!provider || !lease || !address) {
      return;
    }

    const onMessage = (message: any) => {
      if (message.data) {
        message.data
          .text()
          .then(JSON.parse)
          .then((data: string) => setLogs((oldVal) => [...oldVal, data]));
      }
    };

    const watchFn = networkType === 'testnet'
      ? watchLeaseLogsBeta3
      : watchLeaseLogsBeta2;

    watchFn(address, provider, lease?.lease, onMessage).then((connection) => {
      connection.onerror = (error) => {
        console.error('Error on log watch socket:', error);
      };
      socket = connection;
    });

    return () => {
      setLogs([]);

      if (socket) {
        console.log('Closing log watch socket');
        socket.close();
      }
    };
  }, [lease, provider, setLogs]);

  useEffect(() => {
    if (autoScrollWithOutput) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [logs, autoScrollWithOutput]);

  const handleAutoscroll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoScrollWithOutput(e.target.checked);
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="p-2 text-xl font-bold">Application Logs</div>
      <LogsWrapper className="flex-1">
        <ul>
          {logs.map((log: any, i: number) => (
            <LogList key={`log-line-${i}`}>
              <span className="mr-3 text-white mw-3">{i}</span>
              <span className="mr-3 mw-10 text-red-1">{log.name}</span>
              <span className="text-white">{log.message}</span>
            </LogList>
          ))}
          <span ref={bottomRef} />
        </ul>
      </LogsWrapper>
      <div className="flex px-3 pt-6 pb-6">
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setAutoScrollWithOutput(!autoScrollWithOutput)}>
            <Checkbox
              style={{ padding: 0, marginRight: 8 }}
              checked={autoScrollWithOutput}
              onChange={handleAutoscroll}
            />{' '}
            Autoscroll With Output
          </Button>
        </Stack>
      </div>
    </div>
  );
};

const LogsWrapper = styled.div`
  padding: 12px;
  background-color: black;
  width: 100%;
  height: 100%,
  overflow-x: scroll;
  overflow-y: scroll;
`;

const LogList = styled(List)`
  font-family: monospace;
  & span {
    white-space: nowrap;
  }
`;
