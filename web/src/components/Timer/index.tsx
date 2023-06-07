import { Box, styled, Typography } from '@mui/material';
import * as React from 'react';

interface TimerProps {
  startTime: number;
  onTimerEnd?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ startTime, onTimerEnd }) => {
  const [timeRemaining, setTimeRemaining] = React.useState<string | null>('Expired');
  const duration = 60 * 5 * 1000;

  React.useEffect(() => {
    let timer: NodeJS.Timer | null = null;

    const updateTime = () => {
      const now = Date.now();
      const endTime = startTime + duration;
      const ms = endTime - now;

      if (ms > 0) {
        setTimeRemaining(formatTimeRemaining(ms));
        timer = setTimeout(updateTime, 1000);
      } else {
        setTimeRemaining(null);
        if (onTimerEnd) {
          onTimerEnd();
        }
      }
    };

    updateTime();

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [setTimeRemaining]);

  return (
    <TimerWrapper>
      {timeRemaining !== null ? (
        <>
          <Typography component="span">Time Left on Bid:</Typography>
          <Typography
            component="span"
            sx={{ display: 'inline-block', width: '2.125rem', fontWeight: 700 }}
          >
            {timeRemaining}
          </Typography>
        </>
      ) : (
        <>
          <Typography component="span">Bid Expired</Typography>
        </>
      )}
    </TimerWrapper>
  );
};

const TimerWrapper = styled(Box)`
  background-color: ${(props) => props.theme.palette.secondary.light};
  padding: 0.3rem 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;

  & span {
    color: #f43f5e;
  }
`;

function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms - minutes * 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}
