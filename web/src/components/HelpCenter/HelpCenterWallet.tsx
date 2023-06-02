import { HelpCenter } from './HelpCenter';

interface HelpCenterWalletProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterWallet: React.FC<HelpCenterWalletProps> = ({
  isOpen,
  onClose,
}: HelpCenterWalletProps) => {
  return (
    <HelpCenter
      isOpen={isOpen}
      onClose={onClose}
      contentData={[
        {
          type: 'contentBody',
          contentTitle: 'Why Keplr Wallet?',
          contentBody:
            'Deplying workloads on Akash Network requires you to pay in <strong> Akash Token ($AKT) </strong> using a <strong>Keplr Wallet </strong>',
        },
        {
          type: 'card',
          title: 'Download Extension',
          body: 'To use Keplr wallet with Akash Console, install the Keplr browser plugin for your browser',
          link: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
        },

        {
          type: 'contentBody',
          // Make body more consisted with contentBody
          contentBody: 'There are two main ways to fund your Keplr Wallet with AKT:',
        },
        {
          type: 'largeCard',
          // Make body more consisted with contentBody
          internalLinks: [
            { title: 'Kucoin', link: 'https://www.kucoin.com/' },
            { title: 'Crypto.com', link: 'https://crypto.com/' },
            { title: 'Kraken', link: 'https://www.kraken.com/' },
            { title: 'AscendEx', link: 'https://ascendex.com/' },
            { title: 'Gate.io', link: 'https://www.gate.io/' },
            { title: 'DigiFinex', link: 'https://www.digifinex.com/' },
            { title: 'Bittrex', link: 'https://bittrex.com/' },
          ],

          contentBody: 'Purchase them from one of the exchanges listed below: ',
          body: 'If you have tokens of other Cosmos chains you can exchange them for AKT using the Osmosis App',
          title: 'Osmosis App',
          link: 'https://app.osmosis.zone/',
        },
        {
          type: 'card',
          title: 'Akash Docs/ Wallet Setup',
          body: 'For a step-by-step instruction on all that, consult our documentation here',
          link: 'https://docs.akash.network/tokens-and-wallets',
        },
      ]}
    />
  );
};
