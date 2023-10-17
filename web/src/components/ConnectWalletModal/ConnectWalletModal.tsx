import React from 'react';
import styled from '@emotion/styled';
import { CloseButton, HelpCenterTitle } from '../HelpCenter/HelpCenter.styles';
import { useSetRecoilState } from 'recoil';
import { showConnectWalletModal } from '../../recoil/atoms';
import { Wallets, useWallet } from '../../hooks/useWallet';
import LeapWalletLogo from '../../assets/images/leap-cosmos-logo.png';
import KeplrWalletLogo from '../../assets/images/keplr-logo.png';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const ConnectWalletOverlay = styled.div`
  position: fixed;
  z-index: 9999;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
`;

export const ConnectWalletWrapper = styled.div`
  margin: auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 600px;
  padding: 16px;
`;

export const Card = styled.div`
  background-color: #f4f4f4;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

export const Logo = styled.img`
  height: 64px;
  width: 64px;
`;

export const CardTitle = styled.h2`
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 6px;
`;

export const CardBody = styled.p`
  font-size: 15px;
  font-weight: 500;
`;

const keplrUrl = 'https://www.keplr.app/';
const leapUrl =
  'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg';

export function ConnectWalletModal() {
  const setShowConnectWalletModal = useSetRecoilState(showConnectWalletModal);
  const { isKeplrInstalled, isLeapInstalled, connect } = useWallet();

  const handleClose = () => {
    setShowConnectWalletModal(false);
  };

  const onConnectWalletClick = async (
    event: React.MouseEvent<HTMLDivElement>,
    walletSource: Wallets
  ) => {
    if (walletSource === Wallets.KEPLR && !isKeplrInstalled) {
      window.open(keplrUrl, '_blank')?.focus();
      return;
    }

    if (walletSource === Wallets.LEAP && !isLeapInstalled) {
      window.open(leapUrl, '_blank')?.focus();
      return;
    }

    try {
      await connect(walletSource);
    } catch (error) {
      console.log(error);
    } finally {
      handleClose();
    }
  };

  return (
    <ConnectWalletOverlay onClick={handleClose}>
      <ConnectWalletWrapper onClick={(event) => event.stopPropagation()}>
        <HelpCenterTitle style={{ marginBottom: 0 }}>
          Connect Wallet
          <CloseButton
            onClick={handleClose}
            style={{
              position: 'static',
            }}
          >
            &times;
          </CloseButton>
        </HelpCenterTitle>

        <Card onClick={(event) => onConnectWalletClick(event, Wallets.LEAP)}>
          <Logo src={LeapWalletLogo} alt="Leap Wallet Logo" />

          <div>
            <CardTitle>
              {isLeapInstalled ? (
                'Leap Wallet'
              ) : (
                <>
                  Install Leap
                  <OpenInNewIcon
                    fontSize="inherit"
                    style={{
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontSize: '0.875rem',
                      marginLeft: '8px',
                    }}
                  />
                </>
              )}
            </CardTitle>
            <CardBody>
              {isLeapInstalled ? (
                'Leap Browser Extension'
              ) : (
                <span style={{ textDecoration: 'underline' }}>{leapUrl}</span>
              )}
            </CardBody>
          </div>
        </Card>

        <Card onClick={(event) => onConnectWalletClick(event, Wallets.KEPLR)}>
          <Logo src={KeplrWalletLogo} alt="Keplr Wallet Logo" />

          <div>
            <CardTitle>
              {isKeplrInstalled ? (
                'Keplr Wallet'
              ) : (
                <>
                  Install Keplr
                  <OpenInNewIcon
                    fontSize="inherit"
                    style={{
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontSize: '0.875rem',
                      marginLeft: '8px',
                    }}
                  />
                </>
              )}
            </CardTitle>
            <CardBody>
              {isKeplrInstalled ? (
                'Keplr Browser Extension'
              ) : (
                <span style={{ textDecoration: 'underline' }}>{keplrUrl}</span>
              )}
            </CardBody>
          </div>
        </Card>
      </ConnectWalletWrapper>
    </ConnectWalletOverlay>
  );
}
