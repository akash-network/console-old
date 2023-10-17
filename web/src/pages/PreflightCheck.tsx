import React from 'react';
import styled from '@emotion/styled';
import { Box, Button, Card, Stack, Tooltip, CircularProgress } from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useFormikContext } from 'formik';
import {
  activeCertificate,
  deploymentSdl,
  showConnectWalletModal,
  walletState,
} from '../recoil/atoms';
import { getAccountBalance } from '../recoil/api/bank';
import { Icon } from '../components/Icons';
import Delayed from '../components/Delayed';
import { Text, Title } from '../components/Text';
import { uaktToAKT } from '../_helpers/lease-calculations';
import { useWallet } from '../hooks/useWallet';
import { ManifestVersion } from '../_helpers/deployments-utils';
import { SDLSpec } from '../components/SdlConfiguration/settings';
import { queryCertificates } from '../api/queries';
import { useMutation, useQuery } from 'react-query';
import { Certificate_State } from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/cert';
import { Input, Label } from '../components/SdlConfiguration/styling';
import { AntSwitch } from '../components/Switch/AntSwitch';
import { v2Sdl } from '@akashnetwork/akashjs/build/sdl/types';
import { getRpcNode } from '../hooks/useRpcNode';
import { createCertificate } from '../api/mutations';
import logging from '../logging';
import { loadActiveCertificate } from '../api/rpc/beta3/certificates';

export const PreflightCheck: React.FC<Record<string, never>> = () => {
  const [_wallet] = useRecoilState(walletState);
  const [balance, setBalance] = React.useState(0);
  const { submitForm, values, setFieldValue } = useFormikContext<{
    depositor: string | undefined;
    sdl: SDLSpec;
  }>();
  const [certificate, setCertificate] = useRecoilState(activeCertificate);
  const { data: accountCertificates, refetch: refetchCertificates } = useQuery(
    ['certificates', _wallet?.accounts[0]?.address],
    queryCertificates
  );
  const wallet = useWallet();
  const [isValidCert, setIsValidCert] = React.useState(false);
  const [manifestVersion, setManifestVersion] = React.useState<Uint8Array>();
  const [showVerifiedCert, setShowVerifiedCert] = React.useState(false);
  const [useAuthorizedDepositor, setUseAuthorizedDepositor] = React.useState(false);
  const { networkType } = getRpcNode();
  const { mutate: mxCreateCertificate, isLoading } = useMutation(
    ['createCertificate'],
    createCertificate
  );
  const savedSDL = useRecoilValue(deploymentSdl);
  const setShowConnectWalletModal = useSetRecoilState(showConnectWalletModal);

  const hasWallet = window.wallet !== undefined;
  const sdl = values.sdl || savedSDL;

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
      setShowConnectWalletModal(true);
    }
  };

  /* Attempts to calculate the version of the manifest as a quick validation check */
  React.useEffect(() => {
    const sdlPartial = sdl as unknown;
    const rpcVersion = networkType === 'testnet' ? 'beta3' : 'beta2';

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

      if (!activeCert) {
        console.warn('Unable to find certificate: ', certificate);
      }

      const isValid = !!(activeCert && activeCert?.certificate?.state === Certificate_State.valid);

      if (!isValid) {
        console.warn('Certificate is not valid: ', activeCert?.certificate?.state);
      }

      setIsValidCert(isValid);
    }
  }, [certificate, accountCertificates]);

  /* Check if the current active certificate is valid, also? */
  React.useEffect(() => {
    if (showVerifiedCert) {
      setIsValidCert(true);
    }
  }, [showVerifiedCert]);

  /* Automatically connect the wallet if the wallet is installed */
  React.useEffect(() => {
    handleConnectWallet();
  }, []);

  /* Check the current balance of the wallet */
  React.useEffect(() => {
    if (!window.wallet) return;
    if (_wallet.isSignedIn && _wallet?.accounts[0]?.address) {
      const account = values.depositor || _wallet.accounts[0].address;
      getAccountBalance(account).then((result) => {
        const akt = uaktToAKT(result);
        setBalance(akt);
      });
    }
  }, [_wallet, values.depositor]);

  /* Action handler for creating a certificate */
  const handleCreateCertificate = async () => {
    // the query doesn't take any arguments, this little hack keeps
    // typescript happy
    mxCreateCertificate({} as any, {
      onSuccess: async () => {
        setCertificate(await loadActiveCertificate(_wallet?.accounts[0]?.address));
        setShowVerifiedCert(true);
        logging.success('Certificate created successfully');

        refetchCertificates();
      },
      onError: (error: any) => {
        logging.error('Couldn\'t create certificate: ' + error);
      },
    });
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
            {/* Check Wallet & Login */}
            <Stack sx={{ width: '100%' }} spacing="1rem">
              {!hasWallet && (
                <PreflightCheckItemContainer>
                  <div className="flex mb-2">
                    <Icon type="alert" />
                    <Title size={14} className="pl-2">
                      You will need to install a wallet extension for Chrome.
                    </Title>
                    <div className="grow">{/* spacer - do not remove */}</div>

                    <PreflightActionButton onClick={() => setShowConnectWalletModal(true)}>
                      Get Wallet
                    </PreflightActionButton>

                    <Tooltip title="Sign in to your wallet" placement="top">
                      <div className="ml-2">
                        <Icon type="infoGray" />
                      </div>
                    </Tooltip>
                  </div>
                  <Text size={14}>In order to deploy you will need to connect your wallet.</Text>
                </PreflightCheckItemContainer>
              )}

              {hasWallet && !_wallet.isSignedIn ? (
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
                    <Tooltip title="Sign in to your wallet" placement="top">
                      <div className="ml-2">
                        <Icon type="infoGray" />
                      </div>
                    </Tooltip>
                  </div>
                  <Text size={14}>In order to deploy you will need to connect your wallet.</Text>
                </PreflightCheckItemContainer>
              ) : null}
              {hasWallet && _wallet.isSignedIn ? (
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
                      {isLoading ? 'Please wait, creating certificate...' : 'Missing Certificate'}
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
                    {isLoading ? (
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
