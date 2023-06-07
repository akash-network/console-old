import React, { ChangeEventHandler, useState } from 'react';
import { Box, Divider, Stack } from '@mui/material';
import { Bid as BidCard } from '../components/Bid';
import { queryBidsList } from '../api/queries';
import { Bid } from '@akashnetwork/akashjs/build/protobuf/akash/market/v1beta2/bid';
import styled from '@emotion/styled';
import Loading from '../components/Loading';
import { useQuery } from 'react-query';
import { WordSwitch } from '../components/Switch/WordSwitch';
import { Timer } from '../components/Timer';
import { PlaceholderCard } from '../components/PlaceholderCard';
import { getRpcNode } from '../hooks/useRpcNode';

export interface SelectProviderProps {
  deploymentId: { owner: string; dseq: string };
  onNextButtonClick?: (bidId: any) => void;
}

const Title = styled.h2`
  display: inline-block;
  height: 1.75rem;
`;

const sortingMethods = {
  random: {
    algorithm: (ba: Bid, bb: Bid) => 0,
  },
  byPrice: {
    algorithm: (ba: Bid, bb: Bid) =>
      ba.price !== undefined && bb.price !== undefined
        ? parseInt(ba.price.amount) - parseInt(bb.price.amount)
        : 0,
  },
};

const filterMethods = {
  none: {
    algorithm: (bid: any) => true,
  },
  byAudit: {
    algorithm: (bid: any) => bid.auditStatus?.length > 0,
  },
};

export default function SelectProvider({
  onNextButtonClick,
  deploymentId,
}: SelectProviderProps): JSX.Element {
  const [refreshInterval, setRefreshInterval] = useState(1000);
  const [bids, setBids] = useState<Bid[]>([]);
  const { data: bidsResponse } = useQuery(['bids', deploymentId], queryBidsList, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    refetchInterval: refreshInterval
  });

  React.useEffect(() => {
    const bids = bidsResponse?.bids;

    if (bids && bids.length > 0) {
      setRefreshInterval(5000);
      setBids(
        (bids as unknown as Array<{ bid?: Bid }>)
          .filter((bid: { bid?: Bid }) => bid.bid !== undefined)
          .map((bid: { bid?: Bid }) => bid.bid as Bid) // ts has issues with the filter above
      );
    }
  }, [bidsResponse]);

  const [timerExpired, setTimerExpired] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<string>();
  const [sortMethod] = useState(sortingMethods.byPrice);
  const [filterMethod, setFilterMethod] = React.useState(filterMethods.none);

  const isSelectedProvider = (providerId: string) =>
    selectedProvider && providerId === selectedProvider;

  const selectProvider = (providerId: string) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    setSelectedProvider(providerId);
  };

  const toggleFilter: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const checked = evt.target.checked;
    setFilterMethod(checked ? filterMethods.byAudit : filterMethods.none);
  };

  const handleTimerExpire = () => {
    setTimerExpired(true);
  };

  return (
    <Stack className="container akt-card">
      <Box className="flex items-center justify-between mb-2 w-100">
        <Title className="text-lg font-bold">Select a Provider</Title>
        <div className="flex items-center gap-2">
          {/* <Button
          style={{
            height: "30px",
            backgroundColor: "white",
            border: '1px solid #D1D5DB',
            textTransform: "capitalize"
          }}
          variant="outlined"
          color="secondary"
          startIcon={<CachedIcon sx={{ color: "#9CA3AF" }} />}
          onClick={() => refetch()}
        >
          Refresh
        </Button> */}
          <WordSwitch
            on="Only Audited"
            off="All"
            checked={filterMethod === filterMethods.byAudit}
            onChange={toggleFilter}
          />
          <Timer startTime={Date.now()} onTimerEnd={handleTimerExpire} />
        </div>
      </Box>
      <Divider className="mt-2 mb-4" />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="top"
        justifyContent="center"
        flexWrap="wrap"
        gap={2}
        marginTop="1rem"
      >
        {!timerExpired && (
          <Stack>
            <Stack direction="row" flexWrap="wrap" justifyContent="center" gap="1rem">
              {bids &&
                bids
                  .sort(sortMethod.algorithm)
                  .map((bid: any, i: number) => (
                    <BidCard
                      hideIfNotAudited={filterMethod === filterMethods.byAudit}
                      key={i}
                      bid={bid}
                      isSelectedProvider={isSelectedProvider(bid.bidId.provider)}
                      onClick={selectProvider(bid.bidId.provider)}
                      onNextButtonClick={onNextButtonClick}
                      {...bid}
                    />
                  ))}
            </Stack>
            <Loading />
          </Stack>
        )}
        {timerExpired && (
          <>
            <PlaceholderCard title="Bids Expired" icon="alert">
              <p>
                All bids for the deployment have expired. Please close this deployment, and create a
                new one.
              </p>
            </PlaceholderCard>
          </>
        )}
      </Box>
    </Stack>
  );
}
