import { SigningCosmosClient } from '@cosmjs/launchpad';
import { Wallet } from '../recoil/atoms';
import { getRpcNode } from '../hooks/useRpcNode';
import { Wallets } from '../hooks/useWallet';

const initalState = {
  accounts: [],
  offlineSigner: undefined,
  cosmosClient: undefined,
  isSignedIn: '',
  file: '_helpers/wallet-utils.ts',
};

export const getWallet = async (): Promise<Wallet> => {
  const { chainId, rpcNode } = getRpcNode();

  if (!window.wallet) {
    return initalState;
  } else {
    // Enabling before using the Wallet is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await window.wallet.enable(chainId);

    const offlineSigner = window.wallet.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Leap and Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    // Initialize the gaia api with the offline signer that is injected by Leap/Keplr extension.
    const cosmJS = new SigningCosmosClient(rpcNode, accounts[0].address, offlineSigner);

    return {
      accounts: [...accounts],
      offlineSigner: offlineSigner,
      cosmosClient: cosmJS,
      isSignedIn: window.wallet.constructor.name === 'Leap' ? Wallets.LEAP : Wallets.KEPLR,
      file: '_helpers/wallet-utils.ts',
    };
  }
};
