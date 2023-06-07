import { TLSCertificate } from '../rpc/beta2/certificates';

// TODO: this will have to be populated using a ENV variable for production
export const proxyURL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3005/';
export const proxyWSS = process.env.REACT_APP_PROXY_WSS || 'ws://localhost:3005';

export const mtlsFetch = (certificate: TLSCertificate, upstream: string) => {
  return (url: string, params?: { method?: string; body?: any }) =>
    fetch(`${proxyURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        upstream,
      },
      body: JSON.stringify({
        rewrite_method: params?.method || 'GET',
        rewrite_body: params?.body,
        proxy_cert: certificate.csr,
        proxy_key: certificate.privateKey,
      }),
    });
};
