import * as React from 'react';
import { Alert, AlertProps, Box, Snackbar } from '@mui/material';
import logging, { LoggingCallback, LoggingSeverity } from '../../logging';

const severityMap: Map<LoggingSeverity, Severity> = new Map([
  ['error', 'error'],
  ['warn', 'warning'],
  ['success', 'success'],
  ['debug', 'info'],
]);

type LoggingProps = {
  children: React.ReactNode;
};

type Severity = AlertProps['severity'];

const Logging: React.FC<LoggingProps> = function ({ children }) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>('');
  const [severity, setSeverity] = React.useState<Severity>('info');

  const remapSeverity: (type: LoggingSeverity) => Severity = (type) =>
    severityMap.has(type) ? severityMap.get(type) : 'info';

  const onOpen: LoggingCallback = (msg, severity) => {
    setMessage(msg);
    setSeverity(remapSeverity(severity));
    setOpen(true);
  };

  const onClose = () => {
    setMessage('');
    setSeverity('info');
    setOpen(false);
  };

  React.useEffect(() => {
    logging.subscribe(onOpen);
    return () => {
      logging.unsubscribe(onOpen);
    };
  });

  return (
    <>
      {children}

      <Snackbar
        open={open}
        autoHideDuration={null}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box className="w-128">
          <Alert severity={severity}>{message}</Alert>
        </Box>
      </Snackbar>
    </>
  );
};

export default Logging;
