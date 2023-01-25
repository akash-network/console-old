import { FastifyReply, FastifyRequest } from "fastify";

import {
  QueryClientImpl,
  QueryDeploymentsRequest,
  QueryDeploymentsResponse
} from "@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta1/query";

import {
  getRpc
} from "@akashnetwork/akashjs/build/rpc"
import { DeploymentFilters } from "@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta1/deployment";

const endpoint = "http://135.181.181.122:28957";

type DeploymentsSchema = {
  Querystring: { ownerId: string };
};

type RouteHandler<T> = (req: FastifyRequest<T>, res: FastifyReply) => Promise<FastifyReply>;

const deploymentsGetHandler: RouteHandler<DeploymentsSchema> = function ({ query: { ownerId } }, res) {
  const client = new QueryClientImpl(getRpc(endpoint))
  const respond = (code: number) => (data: object) => res.code(code).send(data);

  return client
    .Deployments(QueryDeploymentsRequest.fromJSON({ owner: ownerId }))
    .then(QueryDeploymentsResponse.toJSON)
    .then(respond(200), respond(500));
}

const deploymentsGetRoute = {
  method: 'GET',
  url: '/deployments',
  schema: {},
  handler: deploymentsGetHandler,
}

export default function getDeploymentRoutes() {
  return [
    deploymentsGetRoute
  ]
}

// UTILITY STUFF

function getDeploymentFilter(ownerId: string) {
  const filter: DeploymentFilters = {
    owner: ownerId,
    dseq: null,
    state: null,
  };

  return filter;
}