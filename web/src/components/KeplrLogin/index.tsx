import React from 'react';
import { useRecoilState } from 'recoil';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import KeplrLogo from '../../assets/images/keplr-logo.jpeg';
import { showKeplrWindow } from '../../recoil/atoms';
import { List, ListItem, ListItemText } from '@mui/material';

interface KeplrProps {
  children?: React.ReactNode;
}

export default function Keplr(props: KeplrProps) {
  const { children } = props;
  const [isOpen, setIsOpen] = useRecoilState(showKeplrWindow);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {children}

      {/* Modal to install Keplr Chrome extension */}
      <Dialog onClose={handleClose} open={isOpen}>
        <DialogTitle>Install Keplr Wallet Extension for Chrome</DialogTitle>
        <List sx={{ pt: 0 }}>
          <ListItem>
            <ListItemAvatar>
              <img src={KeplrLogo} width="48" alt="Keplr Logo" />
            </ListItemAvatar>
            <a
              className="ml-3"
              target="_blank"
              href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap"
              onClick={handleClose}
            >
              <ListItemText primary="View it in the Chrome Web Store" />
            </a>
          </ListItem>
        </List>
      </Dialog>
    </>
  );
}
