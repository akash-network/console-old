import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { walletState } from '../recoil/atoms';
import { getWallet } from '../_helpers/wallet-utils';
import logging from '../logging';
import { Keplr } from '@keplr-wallet/types';

export enum Wallets {
  KEPLR = 'keplr',
  LEAP = 'leap',
}

export function useWallet() {
  const [wallet, setWallet] = useRecoilState(walletState);
  const isConnected = wallet.isSignedIn;

  useEffect(() => {
    if (isConnected) {
      window.wallet = window[isConnected as Wallets] as Keplr;

      getWallet()
        .then((res) => {
          setWallet(res);
        })
        .catch(() => {
          disconnectWallet();
        });
    }
  }, [isConnected]);

  const connectWallet = (walletSource: Wallets) => {
    window.wallet = window[walletSource] as Keplr;

    getWallet()
      .then((res) => {
        setWallet(res);
        localStorage.setItem('walletConnected', walletSource);
      })
      .catch((error: { message: string }) => {
        logging.error(`Error connecting to wallet: ${error.message}`);
        console.log(error);
        disconnectWallet();
      });
  };

  const disconnectWallet = () => {
    if (isConnected) {
      localStorage.setItem('walletConnected', '');
      setWallet({
        isSignedIn: '',
        accounts: [],
      });
    }
  };

  return {
    isConnected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    isLeapInstalled: !!window.leap,
    isKeplrInstalled: !!window.keplr,
  };
}
