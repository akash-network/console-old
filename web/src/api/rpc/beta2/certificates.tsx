import React from 'react';
import { BaseAtomComponent } from '../../../recoil/api/basecomponent';

import {
  QueryCertificatesRequest,
  QueryCertificatesResponse,
  QueryClientImpl,
} from '@akashnetwork/akashjs/build/protobuf/akash/cert/v1beta2/query';
import { getMsgClient, getRpc } from '@akashnetwork/akashjs/build/rpc';
import {
  broadcastCertificate,
  createCertificate,
  revokeCertificate,
} from '@akashnetwork/akashjs/build/certificates';
import crypto from 'crypto-js';

export interface CertificateFilter {
  owner: string;
  serial?: string;
  state?: string;
}

export interface TLSCertificate {
  $type: 'TLS Certificate';
  serial: number;
  csr: string;
  publicKey: string;
  privateKey: string;
}

export interface NoCertificate {
  $type: 'Invalid Certificate';
}

export interface CertificateRecord {
  walletId: string;
  hash: string;
  cypher: string;
}

export const createAndBroadcastCertificate = async (rpcEndpoint: string, wallet: any) => {
  const signer = wallet.offlineSigner;
  const client = await getMsgClient(rpcEndpoint, signer);
  const certificate = await createCertificate(wallet.accounts[0].address);
  const response = await broadcastCertificate(
    {
      csr: certificate.csr,
      publicKey: certificate.publicKey,
    },
    wallet.accounts[0].address,
    client
  );

  const idx = saveCertificate(wallet.accounts[0].address, certificate);
  saveActiveSerial(wallet.accounts[0].address, idx);

  return {
    ...response,
    certificate: { $type: 'TLS Certificate', ...certificate } as TLSCertificate,
  };
};

export const broadcastRevokeCertificate = async (
  rpcEndpoint: string,
  wallet: any,
  certSerial: string
) => {
  const signer = wallet.offlineSigner;
  const client = await getMsgClient(rpcEndpoint, signer);

  return revokeCertificate(wallet.accounts[0].address, certSerial, client);
};

export const fetchCertificates = async (filter: CertificateFilter, rpcEndpoint: string) => {
  const request: any = QueryCertificatesRequest.fromPartial({ filter });
  const rpc = await getRpc(rpcEndpoint);
  const client = new QueryClientImpl(rpc);
  const response = await client.Certificates(request);

  for (const cert of response.certificates) {
    if (
      typeof cert?.certificate?.pubkey === 'object' &&
      cert.certificate.pubkey.length === undefined
    ) {
      cert.certificate.pubkey = Uint8Array.from(Object.values(cert.certificate.pubkey as object));
    }
  }

  return response;
};

export const getActiveSerial = (walletId: string) => {
  const key = `active-certificate-serial-${walletId}`;
  const raw = localStorage.getItem(key);

  const index = raw !== null ? JSON.parse(raw) : 0;

  return index as number;
};

export const loadCertificates = (walletId?: string) => {
  const raw = localStorage.getItem('certificates');
  const certs = (typeof raw === 'string' ? JSON.parse(raw) : []) as Array<CertificateRecord>;

  return certs.filter((cert) => walletId === undefined || cert.walletId === walletId);
};

export const getCertificateByIndex = (
  walletId: string,
  index: number
): TLSCertificate | NoCertificate => {
  const certificates = loadCertificates(walletId);
  const cert = certificates[index];

  return cert !== undefined
    ? { $type: 'TLS Certificate', ...decodeCertificate(cert.cypher) }
    : { $type: 'Invalid Certificate' };
};

export const loadActiveCertificate = async (walletId?: string) => {
  if (!walletId) {
    return { $type: 'Invalid Certificate' } as NoCertificate;
  }

  migrateCertificates(walletId);

  const activeSerial = getActiveSerial(walletId);
  return getCertificateByIndex(walletId, activeSerial);
};

export const migrateCertificates = (walletId: string) => {
  const rawLastCert = localStorage.getItem('last-created-certificate');

  if (rawLastCert === null) return;

  const lastCert = JSON.parse(rawLastCert);
  const idx = saveCertificate(walletId, lastCert);
  saveActiveSerial(walletId, idx);
};

export const saveActiveSerial = (walletId: string, idx: number) => {
  localStorage.setItem(`active-certificate-serial-${walletId}`, JSON.stringify(idx));
};

export const saveCertificate = (walletId: string, certificate: any) => {
  const hash = crypto.SHA256(JSON.stringify(certificate)).toString();
  const cypher = encodeCertificate(certificate);
  const certificateList = loadCertificates();

  const certificateMap = Object.fromEntries([
    ...certificateList.map((cert) => [cert.hash, cert]),
    [hash, { walletId, hash, cypher }],
  ]);

  const certSet = new Set(Object.keys(certificateMap));
  const marshaledCerts = [...certSet].map((hash) => certificateMap[hash]);

  localStorage.setItem('certificates', JSON.stringify(marshaledCerts));

  // reload the certificate list to ensure the index is correct
  const certList = loadCertificates(walletId);
  return certList.findIndex((cert) => cert.hash === hash);
};

// Returns a list of the public keys for all available certificates
// for the provided wallet account
export const getAvailableCertificates = (walletId: string) => {
  const certificateList = loadCertificates(walletId);

  return certificateList
    .map((cert) => cert.cypher)
    .map(decodeCertificate)
    .map((cert) => cert.publicKey);
};

// DANGER: Be very careful modifying this function, as it will
// make all existing certificates unavailable.
const loadOrCreateHostKey = () => {
  const raw = localStorage.getItem('host-key');
  const key =
    raw !== null
      ? raw
      : [...new Array(5)].map(() => (Math.random() + 1).toString(36).slice(2)).join('/');

  localStorage.setItem('host-key', key);

  return key;
};

const encryptionKey = (): string => {
  return loadOrCreateHostKey();
};

const encodeCertificate = (certificate: object): string => {
  const secret = encryptionKey();
  const msg = JSON.stringify(certificate);

  const cypher = crypto.AES.encrypt(msg, secret).toString();

  return cypher;
};

const decodeCertificate = (cypher: string): Omit<TLSCertificate, '$type'> => {
  const secret = encryptionKey();
  const strval = crypto.AES.decrypt(cypher, secret).toString(crypto.enc.Utf8);

  return JSON.parse(strval) as TLSCertificate;
};

export const CertificatesListFetch = (props?: {
  owner?: string;
  serial?: string;
  state?: string;
  children?: any;
}) => {
  const doWork = async ({ rpcEndpoint }: any) => {
    const request: any = QueryCertificatesRequest.fromJSON({
      filters: {
        owner: props?.owner || '',
        serial: props?.serial || '',
        state: props?.state || '',
      },
    });

    const rpc = await getRpc(rpcEndpoint);
    const client = new QueryClientImpl(rpc);
    const response = await client.Certificates(request);
    const data: any = QueryCertificatesResponse.toJSON(response);
    return data;
  };

  if (!props?.owner && !props?.serial && !props?.state) {
    return null;
  }

  return <BaseAtomComponent work={doWork}>{props?.children}</BaseAtomComponent>;
};
