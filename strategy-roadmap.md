# Akash Console Roadmap

Strategy and Roadmap that will be updated regularly

## Background and Goals

Akash Console is one of several [clients](https://github.com/akash-network/community/tree/main/sig-clients) for deploying workloads on Akash Network. Akash Network’s [strategy](https://github.com/akash-network/community/blob/main/product-strategy/README.md) is to scale with ecosystem partners, which is why we’re actively invested in nurturing a community of client projects that serve various segments of users who choose to deploy workloads on Akash Network.

What is unique about Akash Console is that it is Open Source and was originally built by the core Overclock Labs team.  Akash Console’s goal is to be the conduit to demonstrate key capabilities being built by the core team at Overclock Labs. Specifically, we currently are focused on demonstrating deployment workflows for the following user segments:
Blockchain Node Operators 
Web developers
AI/ ML developers

Our vision is to build out workflows that demonstrate core features that enable each of those user segments to easily deploy workloads on to Akash. Since there are clients (like Cloudmos, fleek and Spheron) focused on the first two segments, our vertical focus for Console (at least in 2023) will be primarily on the third segment (AI/ ML developers). 

![image](https://github.com/akash-network/console/assets/19495789/47467469-fafc-48df-bd65-7c5dabf0c80d)

![image](https://github.com/akash-network/console/assets/19495789/b2fa5032-2178-43d6-a8b3-f08f8d224f48)


In addition to the above segments, there will be things that will be common to all segments that we will work on. Examples of these, include, UX and workflow for:
- Authorized Spend
- Stable Payments
- Fiat Payments
- Fall Back Providers
- Github PR based deployment workflows
And more

There will be a lot more details and things to be done for each of the above workflows as noted in the next section

## Requirements by User Segments

### Blockchain Node Operators

![image](https://github.com/akash-network/console/assets/19495789/31174bbc-2730-477f-983e-53e9db2765b0)




Console today supports being able to spin up RPC nodes (aka “full nodes”) for common Cosmos chains. Our goal is to expand this to chains beyond Cosmos in the future and learn from users about issues they encounter deploying and managing RPC nodes and build those into our roadmap.

Console also intends to make it easy to deploy and manage a full validator node with ease. The key thing to achieve here is making it easy to configure a full node (which can be deployed with console today) to be a validator node. Some of the problems to solve are:
The validator node needs to know the IDs of the sentry nodes and vice versa. This requires needing to deploy the the nodes twice. This user experience can be improved.
Verifying the validator requires being able to execute commands from the CLI. For this we need to either support shell access or build a better UX for verifying the validator.



### Web Hosting

![image](https://github.com/akash-network/console/assets/19495789/6c5e194e-03d4-4f74-81cb-abd45022405c)


All web3 companies host websites. In most cases, these are static web pages and are being hosted and managed using services like Vercel, Netlify, Gatsby, Wordpress or similar. In order for such users to use Akash, we need to demonstrate a similar ease of use as those other (Web2) applications. There are several things to be solved for this, including:

- Being able to connect to a Github repository 
- Being able to have Console automatically pick up deployment artifacts when they show up in the github repository.
- Being able to have console automatically re-deploy a new version of the application when it become available (solving for the manual bid selection step).
- Being able to specify a primary and one or more secondary providers that will be used in the situation where the primary provider goes down.
- Being able to support migration of stateful applications.

### AI/ ML Workloads

![image](https://github.com/akash-network/console/assets/19495789/13507113-210d-4d06-9c4a-b96e903f36eb)


AI has seen a major influx of open source models (see https://akash.network/blog/the-fast-evolving-ai-landscape/) in the last few months and we expect this to continue. Separately, we see AI as a strong growth opportunity because there is a darth of GPU supply to power these applications, which we think we can fulfill. 

Near term, our goal is to offer the following two workflows to start with:

  - Easy deployment of common open source AI models and data sets for inference. The user experience we want to offer is one where the user is able to choose from a repository of readily available models and data sets or deploy their own custom model. Initially the repository will be powered by SDL images located in the awesome-akash repository and later we will optimize the UX to pull from popular model repositories like Huggingface, Github or SparseZoo. The end result would be that the user would get a list of API endpoints that let them access the deployed model to read data from or build applications on top of.
  - Ability to fine tune a foundational model

Longer-term, our goal is to look at full model training as well as adjacent, value-add use cases, such as:
  - Embeddings-as-a-Service
  - Evaluations-as-a-Service
  - Chaining-Language-models-as-a-Service
  - Hosted vector databases for AI applications.
  - Others (yet to be discovered).


## Feature Roadmap

This is prioritized list of work items that the Console team will need to work on to achieve the goals identified above. For each item, the specific Theme is called out and if it applies to all then it is indicated as “common”
Note that outside this list there are other smaller items and bugs that are being worked on. For the full list, consult https://github.com/akash-network/console/issues and the detailed roadmap here: https://github.com/orgs/akash-network/projects/2/ 


| Task | Description | Theme | State |
| --- | --- | --- | --- |
| RPC Support | Support configuring an RPC server so Console can be used with testnets | common | In-Progress |
| GPU Support | Support being able to deploy SDLs with GPU requests | AI-ML Workloads | In-Progress |
| New Landing Page | Implement new landing page that allows selecting templates based on user segments | Common | In-Progress |
| JSON template driven UI | Enable UI templates to be configurable via JSON configs | Common | In-Progess |
| Authorized Spend Support for Deployment | Ability to use funds from a grantor when deploying workloads | Common | In-progress |
| Authorized Spend support for Grantors | Ability to view and manage funds being authorized | Common | Not Started |
| Shell Access | Provide shell access via Console | Node Deployment / Common | Not Started |
