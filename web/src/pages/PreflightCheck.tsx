import React from 'react';
import styled from '@emotion/styled';
import { Box, Button, Card, Stack, Tooltip, CircularProgress } from '@mui/material';
import { useRecoilState } from 'recoil';
import { useFormikContext } from 'formik';
import { KeplrWallet, activeCertificate, keplrState, rpcEndpoint } from '../recoil/atoms';
import { getAccountBalance } from '../recoil/api/bank';
import { createAndBroadcastCertificate } from '../recoil/api';
import { Icon } from '../components/Icons';
import Delayed from '../components/Delayed';
import { Text, Title } from '../components/Text';
import { uaktToAKT } from '../_helpers/lease-calculations';
import { useWallet } from '../hooks/useWallet';
import { ManifestVersion } from '../_helpers/deployments-utils';
import { SDLSpec } from '../components/SdlConfiguration/settings';
import { queryCertificates } from '../api/queries';
import { useQuery } from 'react-query';
import { Certificate_State } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/cert';
import { Input, Label } from '../components/SdlConfiguration/styling';
import { AntSwitch } from '../components/Switch/AntSwitch';
import { v2Sdl } from '@akashnetwork/akashjs/build/sdl/types';
import { getRpcNode } from '../hooks/useRpcNode';

export const PreflightCheck: React.FC<Record<string, never>> = () => {
  const [keplr] = useRecoilState(keplrState);
  const [balance, setBalance] = React.useState(0);
  const { submitForm, values, setFieldValue } = useFormikContext<{
    depositor: string | undefined;
    sdl: SDLSpec;
  }>();
  const [certificate, setCertificate] = useRecoilState(activeCertificate);
  const { data: accountCertificates } = useQuery(
    ['certificates', keplr?.accounts[0]?.address],
    queryCertificates
  );
  const wallet = useWallet();
  const [isValidCert, setIsValidCert] = React.useState(false);
  const [manifestVersion, setManifestVersion] = React.useState<Uint8Array>();
  const [loading, setLoading] = React.useState(false);
  const [showVerifiedCert, setShowVerifiedCert] = React.useState(false);
  const [useAuthorizedDepositor, setUseAuthorizedDepositor] = React.useState(false);
  const { networkType } = getRpcNode();

  const hasKeplr = window.keplr !== undefined;
  const sdl = values.sdl;

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    if (!checked) {
      setFieldValue('depositor', undefined);
    }

    setUseAuthorizedDepositor(event.target.checked);
  };

  const setDepositorAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('depositor', event.target.value);
  };

  const handleConnectWallet = async () => {
    if (!wallet.isConnected) {
      wallet.connect();
    }
  };

  /* Attempts to calculate the version of the manifest as a quick validation check */
  React.useEffect(() => {
    const sdlPartial = sdl as unknown;
    const rpcVersion = networkType === 'testnet'
      ? 'beta3'
      : 'beta2';

    try {
      // we can safely cast this to v2Sdl because any failure will be caught by the catch block
      ManifestVersion(sdlPartial as v2Sdl, rpcVersion).then(setManifestVersion);
    } catch (e) {
      console.warn('Could not compute manifest version: ', e);
      setManifestVersion(undefined);
    }
  }, [sdl]);

  /* Check if the current active certificate is valid */
  React.useEffect(() => {
    if (accountCertificates && accountCertificates.certificates) {
      const certs: any[] = accountCertificates.certificates;

      const activeCert = certs.find((cert: any) => {
        const pubKey = Buffer.from(
          Object.values(cert.certificate.pubkey) as any,
          'base64'
        ).toString('ascii');
        return certificate.$type === 'TLS Certificate' && certificate.publicKey === pubKey;
      });

      setIsValidCert(!!(activeCert && activeCert?.certificate?.state === Certificate_State.valid));
    }
  }, [certificate, accountCertificates]);

  /* Check if the current active certificate is valid, also? */
  React.useEffect(() => {
    if (showVerifiedCert) {
      setIsValidCert(true);
    }
  }, [showVerifiedCert]);

  /* Automatically connect the wallet if keplr is installed */
  React.useEffect(() => {
    handleConnectWallet();
  }, []);

  /* Check the current balance of the wallet */
  React.useEffect(() => {
    if (!window.keplr) return;
    if (keplr.isSignedIn && keplr?.accounts[0]?.address) {
      const account = values.depositor || keplr.accounts[0].address;
      getAccountBalance(account).then((result) => {
        const akt = uaktToAKT(result);
        setBalance(akt);
      });
    }
  }, [keplr, values.depositor]);

  /* Action handler for creating a certificate */
  const handleCreateCertificate = async () => {
    const { rpcNode } = getRpcNode();
    setLoading(true);
    const result = await createAndBroadcastCertificate(rpcNode, keplr);

    if (result.code === 0 && result.certificate) {
      setCertificate(result.certificate);
      setShowVerifiedCert(true);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
        margin: '0 auto',
        width: '821px',
      }}
    >
      <PreflightCheckWrapper>
        <div>
          <Title size={18} className="h-12 pb-6">
            Checking Essentials
          </Title>
          <Delayed>
            {/* Check Keplr & Login */}
            <Stack sx={{ width: '100%' }} spacing="1rem">
              {!hasKeplr && (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      You will need to install the Keplr wallet extension for Chrome.
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                    <a
                      href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <PreflightActionButton>Get Keplr</PreflightActionButton>
                    </a>
                    <Tooltip title="Sign in to your Keplr wallet" placement="top">
                      <div className="ml-2">
                        <Icon type="infoGray" />
                      </div>
                    </Tooltip>
                  </div>
                  <Text size={14}>In order to deploy you will need to connect your wallet.</Text>
                </PreflightCheckItemContainer>
              )}

              {hasKeplr && !keplr.isSignedIn ? (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      Connect your Wallet
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                    <PreflightActionButton onClick={handleConnectWallet}>
                      Connect Wallet
                    </PreflightActionButton>
                    <Tooltip title="Sign in to your Keplr wallet" placement="top">
                      <div className="ml-2">
                        <Icon type="infoGray" />
                      </div>
                    </Tooltip>
                  </div>
                  <Text size={14}>In order to deploy you will need to connect your wallet.</Text>
                </PreflightCheckItemContainer>
              ) : null}
              {hasKeplr && keplr.isSignedIn ? (
                <PreflightCheckItemContainer>
                  <div className="flex">
                    <Icon type="checkVerified" />
                    <Title size={14} className="pl-3">
                      Wallet Connected
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                  </div>
                </PreflightCheckItemContainer>
              ) : null}

              {balance < 5 && (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      Insufficient funds in your wallet
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                    <div className="flex gap-2">
                      <Label>Use Depositor</Label>
                      <AntSwitch checked={useAuthorizedDepositor} onChange={handleSwitchChange} />
                    </div>
                  </div>
                  <Text size={14}>
                    Minimum wallet balance is at least 5 AKT. You can add funds to your wallet or
                    specify an authorized depositor. Foo
                  </Text>
                  {useAuthorizedDepositor ? (
                    <div className="flex items-center gap-2">
                      <Label className="pt-2">Depositor Address:</Label>
                      <Input
                        value={values.depositor}
                        className="mt-2 grow"
                        placeholder="Enter AKT address"
                        onChange={setDepositorAddress}
                      />
                    </div>
                  ) : null}
                </PreflightCheckItemContainer>
              )}
              {balance >= 5 ? (
                <PreflightCheckItemContainer>
                  <div className="flex">
                    <Icon type="checkVerified" />
                    <Title size={14} className="pl-2">
                      Wallet Funds Sufficient
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                    <div className="flex gap-2">
                      <Label>Use Depositor</Label>
                      <AntSwitch checked={useAuthorizedDepositor} onChange={handleSwitchChange} />
                    </div>
                  </div>
                  {useAuthorizedDepositor ? (
                    <div className="flex items-center gap-2">
                      <Label className="pt-2">Depositor Address:</Label>
                      <Input
                        value={values.depositor}
                        className="mt-2 grow"
                        placeholder="Enter AKT address"
                        onChange={setDepositorAddress}
                      />
                    </div>
                  ) : null}
                </PreflightCheckItemContainer>
              ) : null}

              {manifestVersion === undefined && (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      Invalid SDL
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                  </div>
                  <Text size={14}>
                    SDL could not be validated. Please double-check and ensure all values are
                    correct.
                    {manifestVersion}
                  </Text>
                </PreflightCheckItemContainer>
              )}
              {manifestVersion !== undefined ? (
                <PreflightCheckItemContainer>
                  <div className="flex">
                    <Icon type="checkVerified" />
                    <Title size={14} className="pl-2">
                      SDL is Valid
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                  </div>
                </PreflightCheckItemContainer>
              ) : null}

              {!isValidCert && (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      {loading ? 'Please wait, creating certificate...' : 'Missing Certificate'}
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                    <PreflightActionButton onClick={handleCreateCertificate}>
                      Create Certificate
                    </PreflightActionButton>
                    <Tooltip
                      title="Create a valid certificate on the Akash Network."
                      placement="top"
                    >
                      <div className="ml-2">
                        <Icon type="infoGray" />
                      </div>
                    </Tooltip>
                  </div>
                  <Text size={14}>
                    {loading ? (
                      <div className="flex justify-center">
                        {' '}
                        <CircularProgress />{' '}
                      </div>
                    ) : (
                      'In order to deploy you will need to create a certificate.'
                    )}
                  </Text>
                </PreflightCheckItemContainer>
              )}
              {isValidCert ? (
                <PreflightCheckItemContainer>
                  <div className="flex">
                    <Icon type="checkVerified" />
                    <Title size={14} className="pl-2">
                      Valid Certificate
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>
                  </div>
                </PreflightCheckItemContainer>
              ) : null}
            </Stack>
          </Delayed>
        </div>
      </PreflightCheckWrapper>
      <DeploymentAction>
        <Button variant="contained" onClick={submitForm}>
          Next
        </Button>
      </DeploymentAction>
    </Box>
  );
};

const DeploymentAction = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PreflightCheckWrapper = styled(Card)`
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 24px;
  min-height: 320px;
`;

const PreflightCheckItemContainer = styled.div`
  width: 100%;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const PreflightActionButton = styled(Button)`
  color: #374151;
  background: #ffffff;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 800;
  font-size: 12px;
  padding: 2px 16px;
  height: 38px;
  width: 132px;
  text-transform: none;
`;
