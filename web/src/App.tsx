import React, { lazy, Suspense, useEffect } from 'react';
import './style/app.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Wallet from './components/WalletLogin';
import Logging from './components/Logging';
import Stack from '@mui/material/Stack';
import { useRecoilState } from 'recoil';
import { activeCertificate, walletState } from './recoil/atoms';
import { loadActiveCertificate } from './recoil/api';
import { useWallet } from './hooks/useWallet';
import Loading from './components/Loading';
import { useRpcNode } from './hooks/useRpcNode';
import { getWallet } from './_helpers/wallet-utils';

// Lazy loading all pages in appropriate time
const DeploymentStepper = lazy(() => import('./components/DeploymentStepper'));
const Deployment = lazy(() => import('./components/Deployment'));
const ReDeploy = lazy(() => import('./pages/ReDeploy'));
const Settings = lazy(() => import('./pages/Settings'));
const MyDeployments = lazy(() => import('./pages/MyDeployments'));
const UpdateDeployment = lazy(() => import('./pages/UpdateDeployment'));
const CustomApp = lazy(() => import('./pages/CustomApp'));
const Provider = lazy(() => import('./pages/Provider'));
const Landing = lazy(() => import('./pages/Landing'));

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/landing');
  }, []);

  return <></>;
};

const Help = () => {
  window.location.href = 'https://docs.akash.network/guides/deploy';

  return <></>;
};

const AppRouter = () => {
  return (
    <Router>
      <div className="console-container">
        <SideNav>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={<Welcome />} />
            <Route path="landing/node-deployment" element={<DeploymentStepper />} />
            <Route path="landing/ml-deployment" element={<DeploymentStepper />} />
            <Route path="landing/web-deployment" element={<DeploymentStepper />} />
            <Route path="new-deployment">
              <Route path=":folderName/" element={<DeploymentStepper />} />
              <Route path=":folderName/:templateId" element={<DeploymentStepper />} />
              <Route path=":folderName/:templateId/:intentId" element={<DeploymentStepper />} />
              <Route path="custom-sdl" element={<CustomApp />} />
              <Route path="custom-sdl/:intentId" element={<CustomApp />} />
            </Route>
            <Route path="configure-deployment/:dseq/" element={<DeploymentStepper />} />
            <Route path="provider/:providerId" element={<Provider />} />
            <Route path="my-deployments">
              <Route path="" element={<MyDeployments />} />
              <Route path=":dseq" element={<Deployment />} />
              <Route path=":dseq/update-deployment" element={<UpdateDeployment />} />
              <Route path=":dseq/re-deploy" element={<ReDeploy />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Routes>
        </SideNav>
      </div>
    </Router>
  );
};

export default function App() {
  const [wallet, setWallet] = useRecoilState(walletState);
  const [certificate, setCertificate] = useRecoilState(activeCertificate);
  const { isConnected } = useWallet();
  const [getRpc] = useRpcNode();
  const rpcNode = getRpc();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const checkWallet = async () => {
      if (
        isConnected &&
        window.wallet &&
        wallet.accounts.length > 0 &&
        wallet.accounts[0].address
      ) {
        const _wallet = window.wallet.getOfflineSigner(rpcNode.chainId);

        try {
          const accounts = await _wallet.getAccounts();

          // if the wallet's changed, update the atom
          if (accounts[0].address !== wallet.accounts[0].address) {
            setWallet(await getWallet());
            setCertificate(await loadActiveCertificate(accounts[0].address));
          } else if (certificate.$type === 'Invalid Certificate') {
            const activeCert = await loadActiveCertificate(wallet.accounts[0].address);

            if (activeCert.$type === 'TLS Certificate') {
              setCertificate(activeCert);
            }
          }
        } catch (err) {
          console.warn('unable to update wallet status', err);
        }
      }

      // schedule next check
      timer = setTimeout(checkWallet, 2000);
    };

    // start polling
    checkWallet();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isConnected, certificate, setCertificate, wallet, setWallet]);

  return (
    <Logging>
      <Suspense
        fallback={
          <Stack direction="column">
            <Loading title="Loading" />
          </Stack>
        }
      >
        <Wallet>
          <AppRouter />
        </Wallet>
      </Suspense>
    </Logging>
  );
}
