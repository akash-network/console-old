import { SigningCosmosClient } from '@cosmjs/launchpad';
import { KeplrWallet } from '../recoil/atoms';
import { getRpcNode } from '../hooks/useRpcNode';

const initalState = {
  accounts: [],
  offlineSigner: undefined,
  cosmosClient: undefined,
  isSignedIn: false,
  file: '_helpers/keplr-utils.ts',
};

export const getKeplr = async (): Promise<KeplrWallet> => {
  const { chainId, rpcNode } = getRpcNode();

  if (!window.keplr) {
    return initalState;
  } else {
    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await window.keplr.enable(chainId);

    const offlineSigner = window.keplr.getOfflineSigner(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    const cosmJS = new SigningCosmosClient(rpcNode, accounts[0].address, offlineSigner);

    return {
      accounts: [...accounts],
      offlineSigner: offlineSigner,
      cosmosClient: cosmJS,
      isSignedIn: true,
      file: '_helpers/keplr-utils.ts',
    };
  }
};
