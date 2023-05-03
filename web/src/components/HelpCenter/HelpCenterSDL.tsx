import { HelpCenter } from './HelpCenter';

interface HelpCenterSDLProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterSDL: React.FC<HelpCenterSDLProps> = ({
  isOpen,
  onClose,
}: HelpCenterSDLProps) => {
  return (
    <HelpCenter
      isOpen={isOpen}
      onClose={onClose}
      contentData={[
        {
          type: 'contentBody',
          contentTitle: 'What is SDL?',
          contentBody:
            'SDL stands for “Stack Definition Language” and, as the name suggests, is a way for you (as a user or tenant) to specify what infrastructure stack you need for your application. The SDL file includes compute needs, locations, pricing and other things that help Akash determine the best provider(s) for you to run your application on.',
          footer: true,
        },
        {
          type: 'card',
          title: 'View on Docs',
          body: 'To dig deeper into SDL and it\'s various sections, read this: http://docs.akash.network/readme/stack-definition-language',
          link: 'http://docs.akash.network/readme/stack-definition-language',
        },
        {
          type: 'card',
          title: 'View on Github',
          body: 'To see some sample SDL configurations, check out this awesome akash repository. Each directory in the awesome akash repository contains a sample \'deploy.yaml\' SDL file that deploys a specific application on to-akash!',
          link: 'https://github.com/ovrclk/awesome-akash',
        },
      ]}
    />
  );
};
