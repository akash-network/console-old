import React from 'react';
import Long from 'long';
import {
  QueryClientImpl,
  QueryBidsRequest as Request,
  QueryBidsResponse as Response,
} from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/query';
import { getRpc } from '@akashnetwork/akashjs/build/rpc';
import { BaseAtomComponent } from './basecomponent';

export const MarketBidListFetch = (props?: {
  owner?: string;
  dseq?: number;
  gseq?: string;
  oseq?: string;
  provider?: string;
  state?: string;
  children?: any;
}) => {
  const doWork = async ({ rpcEndpoint }: any) => {
    const request: any = Request.fromJSON({
      filters: {
        owner: props?.owner || '',
        dseq: props?.dseq !== undefined ? new Long(props?.dseq) : Long.UZERO,
        gseq: props?.gseq || 0,
        oseq: props?.oseq || 0,
        provider: props?.provider || '',
        state: props?.state || '',
      },
    });

    const rpc = await getRpc(rpcEndpoint);
    const client = new QueryClientImpl(rpc);
    const response = await client.Bids(request);
    const data: any = Response.toJSON(response);
    return data;
  };

  if (
    !props?.owner &&
    !props?.dseq &&
    !props?.gseq &&
    !props?.oseq &&
    !props?.provider &&
    !props?.state
  ) {
    return null;
  }

  return <BaseAtomComponent work={doWork}>{props?.children}</BaseAtomComponent>;
};
