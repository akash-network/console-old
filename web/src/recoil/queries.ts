import { fetchCertificates } from "./api";
import { rpcEndpoint } from "./atoms";

export const queryCertificates = (context: any) => {
  const { queryKey: [, owner] } = context;

  if (owner !== undefined) {
    return fetchCertificates({ owner }, rpcEndpoint);
  }

  return Promise.resolve([]);
}