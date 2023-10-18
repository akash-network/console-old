import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { showConnectWalletModal, showWalletWindow } from '../../recoil/atoms';
import { HelpCenterWallet } from '../HelpCenter/HelpCenterWallet';
import { ConnectWalletModal } from '../ConnectWalletModal/ConnectWalletModal';

interface WalletProps {
  children?: React.ReactNode;
}

export default function Wallet(props: WalletProps) {
  const { children } = props;
  const [isOpen, setIsOpen] = useRecoilState(showWalletWindow);
  const _showConnectWalletModal = useRecoilValue(showConnectWalletModal);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {children}
      {_showConnectWalletModal ? <ConnectWalletModal /> : null}

      {/* Modal to install Leap/Keplr Chrome extension */}
      <HelpCenterWallet isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
