import React from 'react';
import { useRecoilState } from 'recoil';
import { showKeplrWindow } from '../../recoil/atoms';
import { HelpCenterWallet } from '../../components/HelpCenter/HelpCenterWallet';

interface KeplrProps {
  children?: React.ReactNode;
}

export default function Keplr(props: KeplrProps) {
  const { children } = props;
  const [isOpen, setIsOpen] = useRecoilState(showKeplrWindow);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {children}

      {/* Modal to install Keplr Chrome extension */}
      <HelpCenterWallet isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
