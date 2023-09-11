import img1 from './landingIcons/first_img.png';
import img2 from './landingIcons/www.png';
import img3 from './landingIcons/chip.png';
import img33 from './landingIcons/code.png';
import img4 from './landingIcons/last_guide.png';
import img5 from './landingIcons/sdl_2.png';
import img6 from './landingIcons/sdl_22.png';

interface Tile {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  route: string;
  icon: string;
  buttonEnabled: boolean;
  buttonClass?: string;
}

interface CategoryTiles {
  introText: string;
  tiles: Tile[];
}

interface Metadata {
  version: string;
  categoriesTiles: CategoryTiles;
  sdlGuideTiles: {
    introText: string;
    introDescription: string;
    tiles: {
      step: string;
      text: string;
      image: string;
    }[];
  };
}

export const metadata: Metadata = {
  version: '0.0.1',
  categoriesTiles: {
    introText: 'What would you like to do today?',
    tiles: [
      {
        title: 'Deploy a Blockchain Node',
        description:
          'Easy and low cost hosting for your blockchain nodes (RPC servers, Validators and more)',
        buttonText: 'Choose a Template',
        route: '/landing/node-deployment',
        icon: 'xrayView',
        image: img1,
        buttonEnabled: true,
      },
      {
        title: 'Host a Website or Web Service',
        description:
          'Low cost, decentralized equivalents of the services provided by mainstream cloud providers. Host websites, blogsites, databases and more.',
        buttonText: 'Choose a Template',
        route: '/landing/web-deployment',
        icon: 'www',
        image: img2,
        buttonEnabled: true,
        buttonClass: 'coming-soon-btn-2',
      },
      {
        title: 'Deploy an AI/ML Model',
        description:
          'Popular AI & ML models, deployed in just a few clicks. Includes Stable Diffusion, Falcon, Alpaca, and more.',
        buttonText: 'Choose a Template',
        route: '/landing/ml-deployment',
        icon: 'electronicsChip',
        image: img3,
        buttonEnabled: true,
      },
      {
        title: 'Custom Application',
        description:
          'Define your unique deployment requirements and preferences with SDL and deploy with ease on the flexible and reliable Akash network.',
        buttonText: 'Import SDL',
        route: '',
        icon: 'electronicsChip',
        image: img33,
        buttonEnabled: true,
      },
    ],
  },
  sdlGuideTiles: {
    introText: 'How does it work?',
    introDescription:
      'Deploy on Akash in 3 easy steps. For more information, check out this <a target="_blank" href="https://docs.akash.network/guides/deploy">help page</a>.',
    tiles: [
      {
        step: '01',
        text: 'Start with a template or your own custom application (SDL)',
        image: img6,
      },
      {
        step: '02',
        text: 'Choose a provider based on your preferences and desired price',
        image: img5,
      },
      {
        step: '03',
        text: 'View & manage your deployed application',
        image: img4,
      },
    ],
  },
};
