import { QueryFunction } from 'react-query';
// import { templateIcons } from '../../assets/templates';
import { Octokit } from '@octokit/rest';

export const fetchSdlList: QueryFunction<any, [string, { folderName: string }]> = async ({
  queryKey,
}) => {
  const [, { folderName }] = queryKey;

  if (!folderName) return;

  const octokit = new Octokit({});

  const repository = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}/metadata.json',
    {
      owner: 'akash-network',
      repo: 'deploy-templates',
      path: folderName,
    }
  );

  const data = Buffer.from(repository.data.content, repository.data.encoding).toString('utf-8');

  return JSON.parse(data);
};

export const fetchTemplateList: QueryFunction<any, [string, string]> = async ({ queryKey }) => {
  const octokit = new Octokit({});
  const type = queryKey[1] || 'nodes';

  const repository = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}/metadata.json', {
    owner: 'akash-network',
    repo: 'deploy-templates',
    path: `${type}-master`,
  });

  const data = Buffer.from(
    repository.data.content,
    repository.data.encoding
  ).toString('utf-8');

  return JSON.parse(data);
};


// export const templateList = [
//   {
//     id: 'akash-games',
//     name: 'akash-games',
//     logo: templateIcons.helloworld,
//     title: 'Fun & Games',
//     description: 'Some fun games that you can experiment with',
//   },
//   {
//     id: 'akash',
//     name: 'akash',
//     logo: templateIcons.akash,
//     title: 'Akash',
//     description: 'A Validator Node, RPC Node or Sentry Node that runs on the Akash Network',
//   },
//   {
//     id: 'cosmos',
//     name: 'cosmos',
//     logo: templateIcons.cosmos,
//     title: 'Cosmos',
//     description: 'An RPC Node that runs on the Cosmos Blockchain',
//   },
//   {
//     id: 'kava',
//     name: 'kava',
//     logo: templateIcons.kava,
//     title: 'Kava',
//     description: 'An RPC Node that runs on the Kava Blockchain',
//   },
//   {
//     id: 'chia',
//     name: 'chia',
//     logo: templateIcons.chia,
//     title: 'Chia',
//     description: 'Bladebit, Bladebit-disk or Madmax plotter for the Chia Network',
//   },
//   {
//     id: 'osmosis',
//     name: 'osmosis',
//     logo: templateIcons.osmosis,
//     title: 'Osmosis',
//     description: 'An RPC Node that runs on the Osmosis Blockchain',
//   },
//   {
//     id: 'juno',
//     name: 'juno',
//     logo: templateIcons.juno,
//     title: 'Juno',
//     description: 'An RPC Node that runs on the Juno Blockchain',
//   },
//   {
//     id: 'persistence',
//     name: 'persistence',
//     logo: templateIcons.persistance,
//     title: 'Persistence',
//     description: 'An RPC Node that runs on the Persistence Blockchain',
//   },
//   {
//     id: 'regen',
//     name: 'regen',
//     logo: templateIcons.regan,
//     title: 'Regen',
//     description: 'An RPC Node that runs on the Regen Blockchain',
//   },
//   {
//     id: 'sentinel',
//     name: 'sentinel',
//     logo: templateIcons.sentinel,
//     title: 'Sentinel',
//     description: 'An RPC Node that runs on the Sentinel Blockchain',
//   },
//   {
//     id: 'sifchain',
//     name: 'sifchain',
//     logo: templateIcons.sifchain,
//     title: 'Sifchain',
//     description: 'An RPC Node that runs on the SifChain Blockchain',
//   },
//   {
//     id: 'sommelier',
//     name: 'sommelier',
//     logo: templateIcons.sommelier,
//     title: 'Sommelier',
//     description: 'An RPC Node that runs on the Sommelier Blockchain',
//   },
//   {
//     id: 'irisnet',
//     name: 'irisnet',
//     logo: templateIcons.irisnet,
//     title: 'IRISNet',
//     description: 'An RPC Node that runs on the IRISNet Blockchain',
//   },
//   {
//     id: 'assetmantle',
//     name: 'assetmantle',
//     logo: templateIcons.assetmantle,
//     title: 'Asset Mantle',
//     description: 'An RPC Node that runs on the Asset Mantle Blockchain',
//   },
//   {
//     id: 'bitcanna',
//     name: 'bitcanna',
//     logo: templateIcons.bitcanna,
//     title: 'Bit Canna',
//     description: 'An RPC Node that runs on the Bit Canna Blockchain',
//   },
//   {
//     id: 'digchain',
//     name: 'digchain',
//     logo: templateIcons.digchain,
//     title: 'Dig Chain',
//     description: 'An RPC Node that runs on the Dig Chain Blockchain',
//   },
//   {
//     id: 'evmos',
//     name: 'evmos',
//     logo: templateIcons.evmos,
//     title: 'Evmos',
//     description: 'An RPC Node that runs on the Evmos Blockchain',
//   },
//   {
//     id: 'ixo',
//     name: 'ixo',
//     logo: templateIcons.ixo,
//     title: 'Ixo',
//     description: 'An RPC Node that runs on the Ixo Blockchain',
//   },
//   {
//     id: 'omniflix',
//     name: 'omniflix',
//     logo: templateIcons.omniflix,
//     title: 'Omniflix',
//     description: 'An RPC Node that runs on the Omniflix Blockchain',
//   },
//   {
//     id: 'passage',
//     name: 'passage',
//     logo: templateIcons.passage,
//     title: 'Passage',
//     description: 'An RPC Node that runs on the Passage Blockchain',
//   },
// ];
