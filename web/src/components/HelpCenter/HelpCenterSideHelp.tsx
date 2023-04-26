import { HelpCenter } from './HelpCenter';

interface HelpCenterSideHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterSideHelp: React.FC<HelpCenterSideHelpProps> = ({
  isOpen,
  onClose,
}: HelpCenterSideHelpProps) => {
  return (
    <HelpCenter
      isOpen={isOpen}
      onClose={onClose}
      contentData={[
        {
          type: 'card',
          title: 'Akash Docs',
          body: 'Review detailed documentation',
          link: 'https://docs.akash.network/',
          footer: false,
        },
        {
          type: 'card',
          title: 'Akash Forum',
          body: 'View current and past community discussions',
          link: 'https://github.com/orgs/akash-network/discussions',
        },
        {
          type: 'card',
          title: 'Akash Discord',
          body: 'Join the Discord server and ask any questions',
          link: 'https://discord.akash.network/',
        },
        {
          type: 'card',
          title: 'Akash GitHub',
          body: 'Check out the Akash Network Open Source code bases and community repository',
          link: 'https://github.com/akash-network/',
        },
      ]}
    />
  );
};
