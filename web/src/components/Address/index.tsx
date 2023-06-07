import React from 'react';
import styled from '@emotion/styled';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { Snackbar } from '@mui/material';
import { Icon } from '../Icons';

export interface AddressProps {
  address: string | undefined;
}

export const Address: React.FC<AddressProps> = (props) => {
  const { address } = props;
  const [truncatedAddress, setTruncatedAddress] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (typeof address !== 'string') {
      return;
    }

    let str = '';
    if (address.includes('akash')) {
      str = address.slice(5, address.length + 1);
    } else {
      str = address;
    }
    const front = str.slice(0, 4);
    const back = str.slice(str.length - 4);
    setTruncatedAddress(`${front}...${back}`);
  }, [address]);

  const handleClick = (fullAddress: string) => {
    navigator.clipboard.writeText(fullAddress);
    setMessage('Copied to clipboard!');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (typeof address !== 'string') {
    return <></>;
  }

  return (
    <div>
      <button className="pr-2">
        <FileCopyIcon
          onClick={() => handleClick(address)}
          style={{
            color: '#C9CACD',
            fontSize: 16,
          }}
        />
      </button>
      {address.includes('akash') ? <span className="text-[#adadad]">akash</span> : null}
      {truncatedAddress}
      <Snackbar
        open={open}
        autoHideDuration={2500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SnackbarCard>
          <Icon type="success" />
          <SnackbarCardText>{message}</SnackbarCardText>
          <div className="grow">{/* spacer */}</div>
          <button className="pr-2" onClick={handleClose}>
            <Icon type="close" />
          </button>
        </SnackbarCard>
      </Snackbar>
    </div>
  );
};

const SnackbarCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 384px;
  height: 78px;
  padding: 16px;
  gap: 16px;
  background: #ffffff;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: 1px solid gainsboro;
`;

const SnackbarCardText = styled.div`
  font-family: 'Satoshi-Regular';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
`;
