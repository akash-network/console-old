import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { EventsTable } from '../EventsTable';
import { Logs } from '../Logs';
import { Leases } from '../Leases';

interface DeploymentTabProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const DeploymentTab: React.FC<DeploymentTabProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: '100%', position: 'relative' }}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

function tabProps(i: number) {
  return {
    id: `deployment-tab-${i}`,
    'aria-controls': `deployment-tabpanel-${i}`,
  };
}

export interface DeploymentEventsProps {
  dseq: string;
  lease: any;
  leaseStatus: any;
}

export const DeploymentEvents: React.FC<DeploymentEventsProps> = (props) => {
  const { dseq, lease, leaseStatus } = props;
  const [value, setValue] = React.useState(0);

  const handleChange = (e: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="deployment event tabs">
          <Tab label="Events" {...tabProps(0)} />
          <Tab label="Logs" {...tabProps(1)} />
          <Tab label="Leases" {...tabProps(2)} />
        </Tabs>
      </Box>
      <DeploymentTab value={value} index={0}>
        <EventsTable lease={lease} />
      </DeploymentTab>
      <DeploymentTab value={value} index={1}>
        <Logs lease={lease} />
      </DeploymentTab>
      <DeploymentTab value={value} index={2}>
        <Leases dseq={dseq} lease={lease} status={leaseStatus} />
      </DeploymentTab>
    </Box>
  );
};
