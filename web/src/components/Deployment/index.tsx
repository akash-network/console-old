import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Alert, Button, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { DeploymentEvents } from '../DeploymentEvents';
import { activeCertificate, keplrState, rpcEndpoint } from '../../recoil/atoms';
import { formatCurrency } from '../../_helpers/formatter-currency';
import { flattenObject } from '../../_helpers/flatten-object';
import fetchPriceAndMarketCap from '../../recoil/api/akt';
import { leaseCalculator } from '../../_helpers/lease-calculations';
import { QueryDeploymentResponse } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/query';
import { FundDeploymentButton } from './FundDeploymentButton';
import { CloseDeploymentButton } from './CloseDeploymentButton';
import { CloneDeploymentButton } from './CloneDeploymentButton';
import { Address } from '../Address';
import { uniqueName } from '../../_helpers/unique-name';
import { Icon } from '../Icons';
import { useLeaseStatus } from '../../hooks/useLeaseStatus';
import InfoIcon from '@mui/icons-material/Info';
import { fetchDeployment as beta2FetchDeployment } from '../../api/rpc/beta2/deployments';
import { fetchDeployment as beta3FetchDeployment } from '../../api/rpc/beta3/deployments';
import { getRpcNode } from '../../hooks/useRpcNode';

import { QueryDeploymentResponse as Beta3Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta3/query';
import { QueryDeploymentResponse as Beta2Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/query';
import DeploymentActionButton from './DeploymentActionButton';

const Deployment: React.FC<any> = () => {
  const { dseq } = useParams<any>();
  const keplr = useRecoilValue(keplrState);
  const [appName, setAppName] = React.useState('');
  const [info, setInfo] = React.useState<{ label: string; value: string }[]>([]);
  const [costLease, setCostLease] = React.useState<{ label: string; value: string | number }[]>([]);
  const [endpoints, setEndpoints] = React.useState<{ value: string }[]>([]);
  const [lease, setLease] = React.useState<any>();
  const [deployment, setDeployment] = React.useState<QueryDeploymentResponse>();
  const navigate = useNavigate();
  const leaseStatus = useLeaseStatus(lease?.lease);
  const deploymentIncomplete = deployment?.deployment?.state === 1 && !lease;
  const [refresh, setRefresh] = React.useState(false);
  const certificate = useRecoilValue(activeCertificate);

  const ReDeployTooltip = (
    <Tooltip
      title="This will create a whole new replica of this deployment. The existing deployment will not be touched."
      placement="top"
    >
      <InfoIcon style={{ fontSize: '15px', color: 'lightgrey' }} />
    </Tooltip>
  );

  const UpdateDeploymentTooltip = (
    <Tooltip
      title="This will update a limited set of fields in an existing/ active deployment. Compute resources and placement criteria are not updatable."
      placement="top"
    >
      <InfoIcon style={{ fontSize: '15px', color: 'lightgrey' }} />
    </Tooltip>
  );

  const applicationCache = dseq ? localStorage.getItem(dseq) : null;

  const application = applicationCache ? JSON.parse(applicationCache) : null;

  React.useEffect(() => {
    const getDeployment = async () => {
      const { rpcNode, chainId } = getRpcNode();
      try {
        if (!dseq) return;

        let _lease = {} as any;
        let flatLease = {} as any;
        let image = 'n/a';
        const owner = keplr?.accounts[0]?.address;
        let getDeployment: any = null;

        // TOOD: this should use the query to avoid having to do a version
        // check here
        getDeployment = await beta3FetchDeployment(owner, dseq, rpcNode);
        console.log('deploy', JSON.stringify(Beta3Deployment.toJSON(getDeployment.deployment), null, 2));

        const deployment = flattenObject(getDeployment.deployment) as any;
        const leases = flattenObject(getDeployment.leases) as any;
        const akt = await fetchPriceAndMarketCap();

        if (application !== null && application.image !== null && application.image !== '') {
          image = application.image;
        }

        for (const obj of leases.leases) {
          const _dseq = obj.lease.leaseId.dseq.low;
          if (_dseq === Number(dseq)) {
            _lease = obj;
            setLease(obj);
            flatLease = flattenObject(obj) as any;
          }
        }

        setDeployment(getDeployment.deployment);

        setInfo([
          {
            label: 'Status',
            value: deployment['deployment.state'] === 1 ? 'Active' : 'Not Active',
          },
          {
            label: 'Account',
            value: owner,
          },
          {
            label: 'IP',
            value: 'n/a',
          },
          {
            label: 'Image',
            value: image,
          },
        ]);

        if (
          flatLease['lease.leaseId.provider'] &&
          akt &&
          getDeployment.deployment.deployment &&
          getDeployment.deployment.escrowAccount
        ) {
          const leaseCost = leaseCalculator(
            getDeployment.deployment.deployment,
            getDeployment.deployment.escrowAccount,
            _lease.lease,
            akt.current_price
          );

          if (leaseCost) {
            setCostLease([
              {
                label: 'Provider',
                value: flatLease['lease.leaseId.provider'],
              },
              {
                label: 'Time Left',
                value: leaseCost.timeLeft,
              },
              {
                label: 'Cost/Month',
                value: `${formatCurrency.format(leaseCost.costUsd)} | ${leaseCost.costAkt} AKT`,
              },
              {
                label: 'Spent',
                value: `${formatCurrency.format(leaseCost.spentUsd)} | ${leaseCost.spentAkt} AKT`,
              },
              {
                label: 'Balance',
                value: `${formatCurrency.format(leaseCost.balanceUsd)} | ${leaseCost.balanceAkt
                  } AKT`,
              },
            ]);
          }
        } else {
          setCostLease([
            {
              label: 'Alert',
              value:
                'No lease data available. This happens when a deployment is created and no bid is accepted.',
            },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (refresh) {
      setRefresh(false);
    } else {
      getDeployment();
    }
  }, [dseq, refresh, setRefresh]);

  React.useEffect(() => {
    const result: any = [];
    let count = 0;
    if (leaseStatus?.services) {
      for (const [key] of Object.entries(leaseStatus.services)) {
        if (count === 0) {
          if (leaseStatus.services[key].uris && leaseStatus.services[key].uris.length > 0) {
            leaseStatus.services[key].uris.forEach((uri: string) => {
              result.push({ value: uri });
            });
            setEndpoints(result);
          }
          count++;
        }
      }
    }
  }, [leaseStatus]);

  React.useEffect(() => {
    if (application !== null && application.name !== '') {
      setAppName(application.name);
    } else if (dseq) {
      setAppName(uniqueName(keplr?.accounts[0]?.address, dseq));
    }
  }, []);

  const onCompleteDeployment = () => {
    navigate(`/configure-deployment/${dseq}`);
  };

  // In case that current SDL is deployed from another machine, only show Tooltip and not show re-deploy page
  const ConditionalLinkReDeploy = application !== null ? Link : Tooltip;

  // In case that current SDL is deployed from another machine or status closed, only show Tooltip and not show update page
  const canUpdate = application !== null && deployment?.deployment?.state === 1;

  console.log('Can Update', canUpdate);

  return (
    <Stack>
      {certificate.$type === 'Invalid Certificate' && (
        <Alert severity="warning" variant="filled">
          You don&apos;t have a valid certificate. This is required to view the details of your
          lease. You can create one{' '}
          <Link className="text-[#ffffff] font-bold" to="/settings">
            here
          </Link>
          .
        </Alert>
      )}
      <Grid container spacing={2} style={{ maxWidth: '90vw', width: '90vw', margin: 'auto' }}>
        <Grid item xs={4}>
          <DeploymentCard>
            <div className="flex mb-4">
              <div className="text-2xl font-bold">
                {appName} <span className="text-[#adadad] ml-2">{`(${dseq})`}</span>
              </div>
            </div>
            <DeploymentSectionWrapper>
              {endpoints.length > 0 ? (
                <a href={'http://' + endpoints[0].value} target="_blank" rel="noreferrer">
                  {endpoints[0].value}
                </a>
              ) : null}
            </DeploymentSectionWrapper>
            <DeploymentSectionWrapper style={{ borderBottom: 'none' }}>
              <Stack gap={1}>
                <div className="p-3 text-lg font-bold">Actions</div>
                {deployment?.deployment && deploymentIncomplete && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    aria-label="update deployment"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    startIcon={<Icon type="redeploy" />}
                    onClick={onCompleteDeployment}
                    sx={{
                      justifyContent: 'left',
                      gap: '10px',
                      backgroundColor: '#FFFFFF',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                    }}
                  >
                    Complete Deployment
                  </Button>
                )}
                {deployment?.deployment && !deploymentIncomplete && (
                  <React.Fragment>
                    <DeploymentActionButton
                      tooltipTitle={deployment?.deployment?.state !== 1
                        ? 'It is not allowed to update closed deployment'
                        : 'This SDL is deployed with another tool and can\'t be updated from here'
                      }
                      tooltip={UpdateDeploymentTooltip}
                      linkTo={'update-deployment'}
                      aria-label="update deployment"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      condition={canUpdate}
                      startIcon={<Icon type="update" />}
                    >
                      Update Deployment
                    </DeploymentActionButton>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <ConditionalLinkReDeploy
                        title="This SDL is deployed with another tool and can't be re-deployed from here"
                        placement="top"
                        to={'re-deploy'}
                        className="grow"
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          color="secondary"
                          aria-label="re-deploy"
                          sx={{
                            justifyContent: 'left'
                          }}
                          startIcon={<Icon type="redeploy" />}
                        >
                          Re-Deploy
                        </Button>
                      </ConditionalLinkReDeploy>
                      {ReDeployTooltip}
                    </Stack>
                    <CloneDeploymentButton
                      icon="clone"
                      wallet={keplr}
                      deployment={deployment.deployment}
                    >
                      Clone Deployment
                    </CloneDeploymentButton>
                  </React.Fragment>
                )}
                {deployment?.deployment && deployment?.deployment?.state === 1 && (
                  <CloseDeploymentButton
                    icon="trash"
                    wallet={keplr}
                    deployment={deployment.deployment}
                    onDelete={() => setRefresh(true)}
                  >
                    Delete Deployment
                  </CloseDeploymentButton>
                )}
              </Stack>
            </DeploymentSectionWrapper>
            <DeploymentSectionWrapper>
              <div className="p-3 text-lg font-bold">Info</div>
              {info.map((obj: any, i: number) => (
                <DeploymentInfo key={i}>
                  {obj.label === 'Account' ? (
                    <>
                      <div>{obj.label}:</div>
                      <Address address={obj.value} />
                    </>
                  ) : (
                    <>
                      <div>{obj.label}:</div>
                      <div className="font-medium">{obj.value}</div>
                    </>
                  )}
                </DeploymentInfo>
              ))}
            </DeploymentSectionWrapper>
            <DeploymentSectionWrapper style={{ borderBottom: 'none' }}>
              <div className="p-3 text-lg font-bold">Cost/Lease</div>
              {costLease.map((obj: any, i: number) => (
                <DeploymentInfo key={i}>
                  {obj.label === 'Alert' ? (
                    <Alert severity="warning" variant="filled" style={{ width: '100%' }}>
                      {obj.value}
                    </Alert>
                  ) : (
                    <>
                      {obj.label === 'Provider' ? (
                        <>
                          <div>{obj.label}:</div>
                          <Address address={obj.value} />
                        </>
                      ) : (
                        <>
                          <div>{obj.label}:</div>
                          <div className="font-medium">{obj.value}</div>
                        </>
                      )}
                    </>
                  )}
                </DeploymentInfo>
              ))}
              {deployment?.deployment && (
                <FundDeploymentButton
                  icon="money"
                  deployment={deployment.deployment}
                  wallet={keplr}
                >
                  Add Funds
                </FundDeploymentButton>
              )}
            </DeploymentSectionWrapper>
            <DeploymentSectionWrapper style={{ borderBottom: 'none' }}>
              <div className="p-3 text-lg font-bold">Endpoints</div>
              <Stack
                spacing={2}
                sx={{ minHeight: '72px', marginBottom: '12px', paddingLeft: '12px' }}
              >
                {endpoints.map((obj: any, i: number) => (
                  <a key={i} href={`http://${obj.value}`} target="_blank" rel="noreferrer">
                    {obj.value}
                  </a>
                ))}
              </Stack>
            </DeploymentSectionWrapper>
          </DeploymentCard>
        </Grid>
        <Grid item xs={8}>
          <DeploymentEventsCard>
            {dseq && lease ? (
              <DeploymentEvents dseq={dseq} lease={lease} leaseStatus={leaseStatus} />
            ) : null}
          </DeploymentEventsCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Deployment;

const DeploymentSectionWrapper = styled.div`
  margin-bottom: 24px;
  border-bottom: 1px solid #d1d5db;
`;

const DeploymentInfo = styled.div`
  width: 100%;
  padding: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-top: 1px solid #d1d5db;
`;

const DeploymentCard = styled.div`
  background-color: white;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
`;

const DeploymentEventsCard = styled.div`
  height: 100%;
  background-color: white;
  padding: 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  overflow: hidden;
`;
