# Console - Web

<img src="src/assets/images/akash-logo-text-red.png" width="200" alt="Akash Logo">

[![Bump patch version when push to master](https://github.com/ovrclk/console/actions/workflows/bump.yml/badge.svg?branch=main)](https://github.com/ovrclk/console/actions/workflows/bump.yml)
[![Create and publish a Docker image](https://github.com/ovrclk/console/actions/workflows/deployImage.yaml/badge.svg?branch=main)](https://github.com/ovrclk/console/actions/workflows/deployImage.yaml)
[![Issue Labeler](https://github.com/ovrclk/console/actions/workflows/labeler.yml/badge.svg?branch=main)](https://github.com/ovrclk/console/actions/workflows/labeler.yml)

## Points of Contact

| Role            | Name            | Email                                               | Teams            |
|-----------------|-----------------|-----------------------------------------------------|------------------|
| _Product Owner_ | Anil Murty      | [anil@akash.network](mailto:anil@akash.network)     | @Anil Murty      |
| _Maintainer_    | Flavio Espinoza | [flavio@akash.network](mailto:flavio@akash.network) | @Flavio Espinoza |
| _Maintainer_    | Joseph Tary     | [joseph@akash.network](mailto:joseph@akash.network) | @Joseph Tary     |
| _Maintainer_    | Milos Nikolic   | [milos@akash.network](mailto:milos@akash.network)   | @Milos Nikolic   |

## Stack

- React
- React Router
- CRA
- @Craco
- Recoil
- @monaco-editor
- @mui

## Installation

Install dependencies via

```
yarn install
```

## Environment tasks

| Environment |    Command     | Description                                     |
|-------------|:--------------:|-------------------------------------------------|
| Local       | **yarn start** | Run local React App with hot reloading enabled. |
| Local Prod  | **yarn build** | Run production build.                           |

Build will create new directory name `build` and all files will be there

## Other tasks

| Task         |         Command          | Description                                      |
|--------------|:------------------------:|--------------------------------------------------|
| Test         |      **yarn test**       | Run Web tests                                    |
| Compile css  |       **yarn css**       | Compile project css                              |

## Environment variable

All env variable are executed during build time and can be find in
**_.env_** file and few in **_craco.config.js_** 

| Variable                      | Description                                              |
|-------------------------------|:---------------------------------------------------------|
| RPC_DEPLOYMENTS_LIST          |                                                          |

### Repository structure

```
/
|
├─ web/
|  |
│  ├─ public/           # All static related files
|  |    ├─ index.html/  # SPA root
|  |
|  |─ src/
|  |    ├─ _helpers/     # Utils
|  |    ├─ assets/       # Assets files like fonts and images
|  |    ├─ components/   # Damb for widgets
│  │    ├─ hooks/        # Extracted and repeated functionality
│  │    ├─ pages/        # Complex components representing single page in the app
│  │    ├─ recoil/       # Recoil states
│  │    ├─ style/        # Global styling
│  │    ├─ types/        # TSC Typings
│  │    ├─ index.tsx     # Application start
|  |
├─ Dockerfile           # Container definition
├─ .gitignore           # List of files and folders not tracked by Git
├─ package.json         # Project manifest
├─ tailwind.config.js   # CSS configuration
└─ README.md            # This file
```

Test