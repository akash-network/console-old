import { getRpcNode } from '../../hooks/useRpcNode';

import { loadActiveCertificate } from '../rpc/beta2/certificates';

import * as beta2 from './beta2';
import * as beta3 from './beta3';

import { mtlsFetch } from './mtls';

export async function queryLeaseStatus(
  leaseId: { owner: string, gseq: string, oseq: string, dseq: string },
  providerUrl: string
) {
  const { networkType } = getRpcNode();
  const certificate = await loadActiveCertificate(leaseId.owner);

  if (certificate.$type !== 'TLS Certificate') {
    return Promise.reject('No certificate available');
  }

  const pathFn = networkType === 'testnet'
    ? beta3.paths.leaseStatusPath
    : beta2.paths.leaseStatusPath;

  const fetchPath = pathFn(leaseId);

  return mtlsFetch(certificate, providerUrl)(fetchPath);
}