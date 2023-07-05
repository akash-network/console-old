import React from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { DeploymentMissing } from '../SdlConfiguration/DeploymentMissing';
import { queryProviderInfo } from '../../api/queries';
import { useQuery } from 'react-query';

interface LeaseProps {
  dseq: string;
  lease: any;
  status: any; // TODO: fix type
}

type LabeledValue = { label: string; value: any };

function formatPorts(
  services: Record<string, Array<{ externalPort: string; port: string; host: string }>> | undefined
) {
  if (services) {
    return Object.values(services)
      .map((service) => service.map((rule) => `${rule.externalPort}: ${rule.port}`))
      .join('');
  }

  return '';
}

export const Leases: React.FC<LeaseProps> = ({ dseq, lease, status: leaseStatus }) => {
  const [providerDetails, setProviderDetails] = React.useState<Array<LabeledValue>>([]);
  const [status, setStatus] = React.useState<Array<LabeledValue>>([]);
  const [, setCapabilities] = React.useState<Array<LabeledValue>>([]);
  const [dataCenter, setDataCenter] = React.useState<Array<LabeledValue>>([]);
  const [network, setNetwork] = React.useState<Array<LabeledValue>>([]);
  const [details, setDetails] = React.useState<Array<LabeledValue>>([]);
  const [capacity, setCapacity] = React.useState<Array<LabeledValue>>([]);
  const [, setInfo] = React.useState<Array<LabeledValue>>([]);
  const { data: provider } = useQuery(
    ['providerInfo', lease?.lease?.leaseId?.provider],
    queryProviderInfo
  );
  const attributes = provider?.provider?.attributes as any;

  const applicationCache = localStorage.getItem(dseq);
  const application = applicationCache ? JSON.parse(applicationCache) : null;

  React.useEffect(() => {
    const formatData = async () => {
      try {
        if (attributes) {
          const _attributes = {} as any;
          const _capabilities = [] as any;

          for (const attribute of attributes) {
            if (attribute.key.includes('capabilities')) {
              _capabilities.push({ key: attribute.key, value: attribute.value });
            } else {
              _attributes[attribute.key] = attribute.value;
            }
          }

          console.table(application);

          setProviderDetails([
            { label: 'Name', value: _attributes?.organization },
            { label: 'Region', value: _attributes?.region },
            { label: 'Provider Address', value: provider?.provider?.owner },
          ]);
          setStatus([
            { label: 'Organization', value: _attributes?.organization },
            { label: 'Status', value: _attributes?.status },
            { label: 'Auditors', value: null },
          ]);
          setCapabilities(_capabilities);
          setDataCenter([
            { label: 'Data Center', value: _attributes?.data_center },
            { label: 'Generation', value: _attributes?.generation },
            { label: 'Host URI', value: provider?.provider?.hostUri },
            { label: 'Forwarded Ports', value: formatPorts(leaseStatus?.forwarded_ports) },
          ]);
          setNetwork([
            { label: 'Network Download', value: _attributes?.network_download },
            { label: 'Network Upload', value: _attributes?.network_upload },
            { label: 'CPU', value: _attributes?.cpu },
          ]);
          setDetails([
            { label: 'GSEQ', value: lease?.lease?.leaseId?.gseq },
            { label: 'OSEQ', value: lease?.lease?.leaseId?.oseq },
            { label: 'DSEQ', value: dseq },
          ]);
          setCapacity([
            { label: 'Virtual CPUs', value: application?.cpu },
            { label: 'Memory', value: application?.memory },
            { label: 'Storage', value: application?.storage },
          ]);
          setInfo([
            { label: 'Email', value: provider?.provider?.info?.email },
            { label: 'Website', value: provider?.provider?.info?.website },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    formatData();
  }, [dseq]);

  return (
    <div>
      {application === null ? (
        <div className="p-12">
          <DeploymentMissing dseq={dseq} />
        </div>
      ) : (
        <Box sx={{ flexGrow: 1, backgroundColor: 'pink', padding: 0 }}>
          <Grid container spacing={0} sx={{ backgroundColor: '#F9FAFB' }}>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Provider Details</Title>
                  <Divider />
                  {providerDetails.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Provider Details</Title>
                  <Divider />
                  {status.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
          </Grid>
          <Grid container spacing={0} sx={{ backgroundColor: '#FFFFFF' }}>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Attributes</Title>
                  <Divider />
                  {dataCenter.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Network</Title>
                  <Divider />
                  {network.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
          </Grid>
          <Grid container spacing={0} sx={{ backgroundColor: '#F9FAFB' }}>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Details</Title>
                  <Divider />
                  {details.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
            <Grid item xs={6}>
              <Item>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="stretch"
                  spacing={0.5}
                >
                  <Title>Capacity</Title>
                  <Divider />
                  {capacity.map((obj: any, i: number) => {
                    return (
                      <div key={i}>
                        <Label>{obj.label}</Label>
                        <Value>{obj.value ? obj.value : 'n/a'}</Value>
                      </div>
                    );
                  })}
                </Stack>
              </Item>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
};

const Item = styled.div`
  width: 100%;
  padding: 24px;
  background-color: transparent;
`;

const Title = styled.div`
  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #111827;
`;

const Label = styled.span`
  width: 132px;
  float: left;
  padding-top: 4px;
  padding-bottom: 4px;
  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
`;

const Value = styled.span`
  float: left;
  padding-top: 4px;
  padding-bottom: 4px;
  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
`;
