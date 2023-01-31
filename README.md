# Akash Console - Web UI based deployment tool for Akash Network

Akash Console is an easy to use deployment tool for deploying workloads on to Akash Network providers. It is an alternative to the Command Line Interface (CLI) for less technical users. Akash Console can be run as a hosted service or locally (for development). Overclock Labs (creators of Akash Network) run an instance of Akash Console at https://console-demo.akash.network/. This is currently behind a user auth while it is in beta. Please join our discord server to request access if you would like to be a beta tester. The user auth will be removed, once Console becomes Generally Available (GA).

If you would like to contribute to Akash Console, here are some ways to do so:

1. Beta test and report issues
2. Run it locally (instructions below) to get acquainted with the application
3. Join the Clients SIG (community/sig-clients) meeting to learn about issues or features you can help build

## Microservices Architecture

This repository is broken 3 into microservices.

* api (not in use currently)
* proxy server (handles RPC and Provider handoff)
* front end client

## Dev Environment Setup

To reduce friction, `docker-compose.yml` is provided. simply begin development using:

```bash
docker-compose up
```

`src/` directories in each project have been volume mounted. In most instances the docker image does not need to be rebuilt. But there are currently some scenarios where that may need to happen.

* proxy server changes
* web changes outside of src/

## Development Dependencies

Please ensure you have the below set of dependencies installed on your workstation:

* node 18+
* yarn (1.22.19)
* concurrently (7.2.2)
* craco (6.4.4)

Install dependencies by running
```
npm install -g yarn concurrently craco
```

## Workspaces

this project uses `yarn workspace` to manage the monorepo. Benefits include module resolution across all workspaces, and collapsed `node_modules/` directory across these uses. For the most part projects are `atomic` however, a single `yarn.lock` file is present for all modules resolved.

local development can be done using workspaces.

Install dependencies

```bash
yarn install
```

Start all microserves, and launch the `create-react-app` dev server.

```bash
yarn dev
```

### Working with Workspaces

workspaces function as a typical yarn command. The only difference is prefixing the command with the workspace you are interacting inside. example of adding a module to the workspace `web`

```bash
yarn workspace web add module@module
```

the root `package.json` defines the workspaces, root scripts and shared modules. 

## Note for MacOS

If you see errors regarding port 5000 being in use, this is due to AirPlay
using the port. You can disable this service in the MacOS Sharing settings.
