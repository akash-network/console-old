export const mainnetId = 'mainnet';
export const testnetId = 'testnet';
export const edgenetId = 'edgenet';

export let selectedNetworkId = '';

export let networkVersion: any;

export function setNetworkVersion() {
  const _selectedNetworkId = localStorage.getItem('selectedNetworkId');

  switch (_selectedNetworkId) {
    case mainnetId:
      networkVersion = 'v1beta2';
      selectedNetworkId = mainnetId;
      break;
    case testnetId:
      networkVersion = 'v1beta2';
      selectedNetworkId = testnetId;
      break;
    case edgenetId:
      networkVersion = 'v1beta2';
      selectedNetworkId = edgenetId;
      break;

    default:
      networkVersion = 'v1beta2';
      selectedNetworkId = mainnetId;
      break;
  }
}

export const aktPriceApi = 'https://api.coingecko.com/api/v3/coins/akash-network';
