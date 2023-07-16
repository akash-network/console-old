import img1 from './landingIcons/first_img.png';
import img2 from './landingIcons/www.png';
import img3 from './landingIcons/chip.png';
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
        buttonText: 'Coming Soon',
        route: '',
        icon: 'www',
        image: img2,
        buttonEnabled: true,
      },
      {
        title: 'Deploy an AI/ ML Model',
        description:
          'Popular AI & ML models, deployed in just a few clicks. Includes Stable Diffusion, GPT4All, Alpaca and more.',
        buttonText: 'Coming Soon',
        route: '',
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
        image: img3,
        buttonEnabled: true,
      },
    ],
  },
  sdlGuideTiles: {
    introText: 'How it works?',
    introDescription:
      'There are 3 main steps to deploying on Akash. Check out our detailed help for more.',
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
