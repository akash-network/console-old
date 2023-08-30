import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import styled from '@emotion/styled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturbOffIcon from '@mui/icons-material/DoDisturbOff';
import { activeCertificate, keplrState, optIntoAnalytics } from '../recoil/atoms';
import {
  TLSCertificate,
  getAvailableCertificates,
  getCertificateByIndex,
  saveActiveSerial,
} from '../recoil/api';
import { AntSwitch } from '../components/Switch/AntSwitch';
import { Address } from '../components/Address';
import { useMutation, useQuery } from 'react-query';
import { useWallet } from '../hooks/useWallet';
import { queryCertificates } from '../api/queries';
import { QueryCertificatesResponse } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/query';
import { RpcSettings, defaultRpcSettings, sandboxRpcSettings, testnetRpcSettings, useRpcNode } from '../hooks/useRpcNode';
import { Input } from '../components/SdlConfiguration/styling';
import { isRpcNodeStatus } from '../api/rpc/beta2/rpc';
import testnetChainInfo from '../_helpers/testnet-chain';
import sandboxChainInfo from '../_helpers/sandbox-chain';
import { createCertificate, revokeCertificate } from '../api/mutations';
import logging from '../logging';

type SortableCertificate = {
  available: boolean;
  current: boolean;
  certificate: { state: string };
  serial: string;
};

const byCertificateStatus = (a: SortableCertificate, b: SortableCertificate) => {
  // always put the active certificate on top
  if (a.current) {
    return -1;
  }

  // send revoked certificates to the bottom of the list
  const aState = a.certificate.state;
  const bState = b.certificate.state;

  if (aState === 'revoked' && bState !== 'revoked') {
    return 1;
  } else if (bState === 'revoked' && aState !== 'revoked') {
    return -1;
  }

  // bubble available certificates to the top of the list
  if (a.available && !b.available) {
    return -1;
  } else if (b.available && !a.available) {
    return 1;
  }

  return a.serial > b.serial ? 1 : -1;
};

type FieldInfo<T> = {
  title: string;
  subtitle: string;
  value: string;
  options: T[];
};

const defaultRpcNodes = [
  {
    rpcNode: defaultRpcSettings.rpcNode,
    name: 'Mainnet',
  },
  {
    rpcNode: testnetRpcSettings.rpcNode,
    name: 'Testnet',
  },
  {
    rpcNode: sandboxRpcSettings.rpcNode,
    name: 'Sandbox'
  },
  {
    rpcNode: '',
    name: 'Custom',
  },
];

const isCustomRpcNode = (rpcNode: string) => {
  return !defaultRpcNodes.find((node) => node.rpcNode === rpcNode);
};

const AddCustomChainButton: React.FC<{ chainId: string }> = ({ chainId }) => {
  const chainConfigs = new Map([
    ['testnet-02', testnetChainInfo],
    ['sandbox-01', sandboxChainInfo],
  ]);

  const addCustomChain = () => {
    const chainInfo = chainConfigs.get(chainId);

    if (window && window.keplr && window.keplr.experimentalSuggestChain && chainInfo) {
      window.keplr.experimentalSuggestChain(chainInfo);
    }
  };

  return (
    <Button variant="outlined" onClick={addCustomChain}>
      Add Custom Chain For Testnet
    </Button>
  );
};

const Settings: React.FC<Record<string, never>> = () => {
  const keplr = useRecoilValue(keplrState);
  const [currentActiveCertificate, setCurrentActiveCertificate] = useRecoilState(activeCertificate);
  const [certificatesList, setCertificatesList] = React.useState<
    (SortableCertificate & TLSCertificate)[]
  >([]);
  const [currentCertificate, setCurrentCertificate] = React.useState<any>({});
  const [showAll, setShowAll] = React.useState(false);
  const [currency] = React.useState('AKT');
  const [revokeOpen, setRevokeOpen] = React.useState(false);
  const [revokeCert, setRevokeCert] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [changeOpen, setChangeOpen] = React.useState(false);
  const [showProgress, setShowProgress] = React.useState(false);
  const [fields, setFields] = React.useState<FieldInfo<string | TLSCertificate>[]>([]);
  const [optInto, setOptInto] = useRecoilState(optIntoAnalytics);
  const [getRpcNode, setRpcNode] = useRpcNode();
  const [rpcNodeStatus, setRpcNodeStatus] = React.useState('');
  const [candidateRpcNode, setCandidateRpcNode] = React.useState(getRpcNode().rpcNode);
  const [rpcNodeValid, setRpcNodeValid] = React.useState(false);
  const [candidateRpcSettings, setCandidateRpcSettings] = React.useState<RpcSettings>();
  const wallet = useWallet();
  const { mutate: mxCreateCertificate } = useMutation(['createCertificate'], createCertificate);
  const { mutate: mxRevokeCertificate } = useMutation(['revokeCertificate'], revokeCertificate);

  // this is updated to force a refresh
  const [chainInfo, setChainInfo] = React.useState(getRpcNode());
  const { rpcNode, chainId } = chainInfo;

  const handleConnectWallet = (): void => {
    wallet.connect();
  };

  const availableCertificates = useMemo(
    () => getAvailableCertificates(keplr?.accounts[0]?.address),
    [keplr?.accounts[0]?.address]
  );

  const { data: certificates, refetch } = useQuery(
    ['certificates', keplr?.accounts[0]?.address],
    queryCertificates
  );

  // This function is cashed here, and also it forbid clicking outside the Dialog which confuses me a lot
  const onCloseDialog = React.useCallback(
    (callback: (arg: any) => void, value: any, reason: string | boolean) => {
      // https://mui.com/material-ui/api/dialog/#props
      if (reason && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
        return;
      }
      callback(value);
    },
    [setCreateOpen, setRevokeOpen]
  );

  const handleOptIntoAnalytics = () => setOptInto(!optInto);

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAll(!e.target.checked);
  };

  const handleCreateCertificate = React.useCallback(async () => {
    setShowProgress(true);
    // the query doesn't take any arguments, this little hack keeps
    // typescript happy
    mxCreateCertificate(({} as any), {
      onSuccess: () => {
        refetch();
        setCreateOpen(false);
      },
      onError: (error: any) => {
        logging.error('Failed to create certificate: ' + error);
        setShowProgress(false);
      }
    });
  }, [keplr, rpcNode]);

  const handleRevokeCertificate = React.useCallback(async () => {
    setShowProgress(true);

    mxRevokeCertificate(revokeCert, {
      onSuccess: () => {
        refetch();
        setRevokeOpen(false);
        setShowProgress(false);
        setRevokeCert('');
      },
      onError: (error: any) => {
        logging.error('Failed to revoke certificate: ' + error);
        setShowProgress(false);
      }
    });
  }, [keplr, revokeCert, rpcNode]);

  const handleVerifyRpcNode = React.useCallback(async () => {
    const rpcNode = candidateRpcNode.trim();
    if (!rpcNode) {
      return;
    }

    const response = await fetch(`${rpcNode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'status',
        params: {},
        id: 1,
      }),
    });

    if (response.status === 200) {
      const data = (await response.json()) as { result: unknown };

      if (data && isRpcNodeStatus(data.result)) {
        setRpcNodeValid(true);
        setRpcNodeStatus(`Valid node for ${data.result.node_info.network}`);
        setCandidateRpcSettings({
          rpcNode: rpcNode,
          chainId: data.result.node_info.network,
          networkType: data.result.node_info.network === 'akashnet-2'
            ? 'mainnet'
            : 'testnet',
        });
        return;
      }
    }

    setRpcNodeValid(false);
    setRpcNodeStatus('Invalid node');
  }, [candidateRpcNode]);

  const handleSubmitRpcNode = React.useCallback(async () => {
    const rpcNode = candidateRpcNode.trim();

    if (!rpcNode || !candidateRpcSettings) {
      return;
    }

    setRpcNode(candidateRpcSettings);
    setChainInfo(candidateRpcSettings);
    setChangeOpen(false);
    location.reload();
  }, [candidateRpcNode, candidateRpcSettings, setRpcNode, setChainInfo, setChangeOpen]);

  // if the candidate rpc node changes, reset the validation
  React.useEffect(() => {
    setRpcNodeValid(false);
    setRpcNodeStatus('');
  }, [candidateRpcNode]);

  React.useEffect(() => {
    const result = [];

    if (!certificates?.certificates) {
      return;
    }

    // TODO: figure out why this throws an exception for some certs
    let certificateList: any[] = [];
    try {
      // this is somewhat dangerous, as we don't know which version the certificates are
      // but they should be compatible (for now at least)
      certificateList = (QueryCertificatesResponse.toJSON((certificates as any)) as any).certificates;
    } catch (e) {
      console.error(e, certificates);
      return;
    }

    for (const cert of certificateList) {
      const pubKey = Buffer.from(cert.certificate.pubkey, 'base64').toString('ascii');

      if (
        currentActiveCertificate.$type === 'TLS Certificate' &&
        pubKey === currentActiveCertificate.publicKey
      ) {
        const current = {
          current: true,
          available: true,
          index: availableCertificates.indexOf(pubKey),
          pubKey,
          ...cert,
        };
        setCurrentCertificate(current);
        result.push(current);
      } else {
        result.push({
          current: false,
          available: availableCertificates.indexOf(pubKey) !== -1,
          index: availableCertificates.indexOf(pubKey),
          pubKey,
          ...cert,
        });
      }
    }

    setCertificatesList(result);
  }, [keplr?.accounts[0]?.address, currentActiveCertificate, certificates]);

  const activateCertificate = useCallback(
    (index: number) => {
      const newCert = getCertificateByIndex(keplr?.accounts[0]?.address, index);

      saveActiveSerial(keplr?.accounts[0]?.address, index);
      setCurrentActiveCertificate(newCert);
    },
    [saveActiveSerial, setCurrentActiveCertificate]
  );

  React.useEffect(() => {
    const _fields = [
      {
        title: 'Network',
        subtitle: 'Select your preferred network',
        value: chainId,
        options: [chainId],
      },
      {
        title: 'Currency',
        subtitle: 'Select your preferred currency',
        value: currency,
        options: ['AKT'],
      }
    ];
    setFields(_fields);
  }, [chainId, certificatesList]);

  return (
    <Grid container sx={{ flexGrow: 1, paddingTop: 4 }} justifyContent="center" spacing={2}>
      <Grid item xs={10}>
        <div className="text-2xl font-bold">Settings</div>
      </Grid>
      <Grid item xs={10}>
        <SettingsCard>
          <SettingsField>
            <div className="text-base font-bold text-[#111827]">RPC Endpoint</div>
            <Stack direction="row" alignItems="center" gap="1rem">
              <div>{rpcNode}</div>
              <Button variant="outlined" onClick={() => setChangeOpen(true)}>
                Change
              </Button>
            </Stack>
          </SettingsField>


          {fields.map((obj: any, i: number) => (
            <SettingsField key={i}>
              <div className="flex-none">
                <div className="text-base font-bold text-[#111827]">{obj.title}</div>
              </div>

              <div className="flex-none">{obj.value}</div>
            </SettingsField>
          ))}

          <SettingsField>
            <div className="flex-none">
              <div className="text-base font-bold text-[#111827]">Analytics</div>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ marginBottom: '24px' }}>
                <AntSwitch
                  checked={optInto}
                  onChange={handleOptIntoAnalytics}
                  inputProps={{ 'aria-label': 'ant design' }}
                />
                <Typography>{optInto ? 'Opted-in' : 'Opted-out'}</Typography>
              </Stack>
            </div>
          </SettingsField>

          <SettingsField key='certificates'>
            <div className="flex-none">
              <div className="text-base font-bold text-[#111827]">Certificates</div>
              {certificatesList.length > 0 ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ marginBottom: '24px' }}
                >
                  <AntSwitch
                    checked={!showAll}
                    onChange={handleToggleAll}
                    inputProps={{ 'aria-label': 'ant design' }}
                  />
                  <Typography>Valid only</Typography>
                </Stack>
              ) : null}
            </div>

            <div className="flex-none mb-2">
              {wallet.isConnected ? (
                <Button variant="outlined" onClick={() => setCreateOpen(true)}>
                  Generate New Certificate
                </Button>
              ) : (
                <Button variant="contained" onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </SettingsField>

          {/* no certificates - new user */}
          {certificatesList.length < 1 && (
            <Alert severity="error" variant="filled">
              You don't have any certificates. You must generate a new certificate to deploy.
            </Alert>
          )}

          {/* no current valid certificate */}
          {certificatesList.length > 0 && currentCertificate?.certificate?.state !== 'valid' && (
            <Alert severity="error" variant="filled">
              You don't have a valid certificate. You must generate a new certificate to deploy.
            </Alert>
          )}

          {certificatesList.length > 0
            ? certificatesList.sort(byCertificateStatus).map((d: any, i: number) => {
              if (!showAll) {
                // eslint-disable-next-line array-callback-return
                if (d.certificate.state === 'revoked' || !d.available) return;
              }
              return (
                <SettingsField key={i}>
                  <SettingsCertificateCard>
                    <div className="flex items-center">
                      <div className="flex mr-6">
                        <span className="text-base font-bold text-[#111827] mr-2">Cert:</span>
                        <Address address={d.certificate.cert} />
                      </div>
                      <div className="flex">
                        <span className="text-base font-bold text-[#111827] mr-2">Pubkey:</span>
                        <Address address={d.certificate.pubkey} />
                        {d.available ? 'Available' : 'Unavailable'}
                      </div>
                      <div className="ml-6 text-[#FA5757]">
                        {d.current ? <div>Current</div> : null}
                      </div>
                      <div className="grow">{/* spacer */}</div>
                      <div className="border-r w-[106px] mr-2">
                        {d.certificate.state === 'revoked' ? (
                          <DoDisturbOffIcon style={{ color: '#C9CACD' }} />
                        ) : (
                          <CheckCircleIcon style={{ color: '#C9CACD' }} />
                        )}
                        <span className="ml-2">{d.certificate.state}</span>
                      </div>
                      {d.certificate.state === 'valid' && (
                        <div className="w-20">
                          <Button
                            onClick={() => {
                              setRevokeCert(d.serial);
                              setRevokeOpen(true);
                            }}
                          >
                            Revoke
                          </Button>
                        </div>
                      )}
                      {d.available && (
                        <div className="w-20">
                          <Button onClick={() => activateCertificate(d.index)}>Activate</Button>
                        </div>
                      )}
                    </div>
                  </SettingsCertificateCard>
                </SettingsField>
              );
            })
            : null}
        </SettingsCard>
      </Grid>

      {/* Create Certificate */}
      <Dialog
        fullWidth={false}
        maxWidth="xs"
        onClose={(event, reason) =>
          onCloseDialog(setCreateOpen, false, showProgress ? reason : false)
        }
        open={createOpen}
      >
        <DialogTitle>Create Certificate</DialogTitle>
        <DialogContent>
          {showProgress ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : (
            <>
              <p className="pb-12 text-[#6B7280]">This will create a new certificate.</p>
              <div className="flex justify-center">
                <Button
                  className="w-[180px]"
                  variant="outlined"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <div className="w-[20px]">{/* spacer */}</div>
                <Button className="w-[180px]" variant="contained" onClick={handleCreateCertificate}>
                  Create
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Certificate */}
      <Dialog
        fullWidth={false}
        maxWidth="xs"
        onClose={(_, reason) => onCloseDialog(setRevokeOpen, false, showProgress ? reason : false)}
        open={revokeOpen}
      >
        <DialogTitle>Revoke Certificate</DialogTitle>
        <DialogContent>
          {showProgress ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : (
            <>
              <p className="pb-12 text-[#6B7280]">This cannot be undone. {revokeCert}</p>
              <div className="flex justify-center">
                <Button
                  className="w-[180px]"
                  variant="outlined"
                  onClick={() => {
                    setRevokeOpen(false);
                    setRevokeCert('');
                  }}
                >
                  Cancel
                </Button>
                <div className="w-[20px]">{/* spacer */}</div>
                <Button className="w-[180px]" variant="contained" onClick={handleRevokeCertificate}>
                  Revoke
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Change RPC */}
      <Dialog
        fullWidth={false}
        maxWidth="xs"
        onClose={(_, reason) => onCloseDialog(setChangeOpen, false, showProgress ? reason : false)}
        open={changeOpen}
      >
        <DialogTitle>Change RPC Endpoint</DialogTitle>
        <Stack paddingX={3}>
          <Box>New RPC endpoint URL:</Box>
          <Stack>
            <RadioGroup>
              {defaultRpcNodes.map((node) => (
                <FormControlLabel
                  key={node.name}
                  value={node.rpcNode}
                  control={<Radio />}
                  label={node.name}
                  checked={candidateRpcNode === node.rpcNode || (node.name === 'Custom' && isCustomRpcNode(candidateRpcNode))}
                  onChange={() => setCandidateRpcNode(node.rpcNode)}
                />
              ))}
            </RadioGroup>
          </Stack>
          <Input
            name="candidateRpcNode"
            value={candidateRpcNode}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setCandidateRpcNode(event.target.value)
            }
          />
          <div>{rpcNodeStatus}</div>
        </Stack>
        <DialogContent>
          {showProgress ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : (
            <>
              {candidateRpcSettings && candidateRpcSettings.networkType !== 'mainnet' && <div className="flex justify-center p-3">
                <AddCustomChainButton chainId={candidateRpcSettings.chainId} />
              </div>}
              <div className="flex justify-center">
                <Button
                  className="w-[180px]"
                  variant="outlined"
                  onClick={() => {
                    setChangeOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <div className="w-[20px]">{/* spacer */}</div>

                {!rpcNodeValid ? (
                  <Button className="w-[180px]" variant="contained" onClick={handleVerifyRpcNode}>
                    Verify
                  </Button>
                ) : (
                  <Button className="w-[180px]" variant="contained" onClick={handleSubmitRpcNode}>
                    Submit
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default Settings;

const SettingOptionText = (props: { initialValue: string; onChange: (newVal: string) => void }) => {
  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange(e.target.value);
    },
    [props.onChange]
  );

  return (
    <div>
      <SettingsInput defaultValue={props.initialValue} onChange={updateValue}></SettingsInput>
    </div>
  );
};

const SettingsInput = styled.input`
  width: 24rem;
  padding: 10px 16px;
  border: 1px solid #d7d7d7;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #d7d7d7;
  text-align: right;
`;

const SettingsCard = styled(Paper)`
  padding: 24px;
  text-align: left;
  border: 0.75px solid gainsboro;
  border-radius: 8px;
`;

const SettingsField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 16px;
  border-bottom: 1px solid gainsboro;
`;

const SettingsCertificateCard = styled.div`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
`;
