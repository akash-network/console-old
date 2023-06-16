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

import { QueryLeaseResponse as Beta2Lease } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import { QueryLeaseResponse as Beta3Lease } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta3/query';

type LogsProps = {
  lease: Beta2Lease | Beta3Lease;
}

export const Logs: React.FC<LogsProps> = ({ lease }) => {
  const { networkType } = getRpcNode();
  const { data: provider } = useQuery(
    ['providerInfo', lease?.lease?.leaseId?.provider],
    queryProviderInfo
  );
  const address = (lease as any).lease?.leaseId?.owner;
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScrollWithOutput, setAutoScrollWithOutput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let socket: null | WebSocket = null;
    let flushInterval: null | NodeJS.Timer = null;
    const logSize = 10000;
    const newLogs = new Array(logSize);
    let logIndex = 0;

    if (!provider || !lease || !address) {
      return;
    }

    const onMessage = (message: MessageEvent<any>) => {
      if (message.data) {
        newLogs[logIndex % logSize] = message.data;
        logIndex += 1;
      }
    };

    const flushMessages = () => {
      Promise.all(newLogs.slice(0, logIndex).map((log) => log.text().then(JSON.parse)))
        .then((newLogs) => {
          setLogs((oldVal) => [...oldVal, ...newLogs]);
          logIndex = 0;
        });
    };

    if (flushInterval === null) {
      flushInterval = setInterval(flushMessages, 2000);
    }

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

      if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
      }

      if (socket) {
        console.log('Closing log watch socket');
        socket.close();
      }
    };
  }, [lease, provider, setLogs]);

  useEffect(() => {
    if (autoScrollWithOutput && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
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
