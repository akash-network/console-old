import React from 'react';
import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  Button,
  DialogContent,
  DialogActions,
  DialogTitle,
} from '@mui/material';
import { Text } from '../Text';

export type CloseReason = 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick';

export interface DialogProps extends MuiDialogProps {
  title: string;
  message: string;
  buttonText?: string;
  children?: React.ReactNode;
  onClose: (reason: CloseReason) => void;
}

export const Dialog = (props: DialogProps) => {
  const { title, message, buttonText, open, onClose, children } = props;
  return (
    <MuiDialog
      disableEscapeKeyDown={true}
      onClose={(_, reason) => onClose(reason)}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Text size={14}>{message}</Text>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose('closeButtonClick')} color="primary">
          {buttonText ? buttonText : 'Close'}
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};

/**
 * @example
 * const SimpleDialogDemo = () => {
 * const [open, setOpen] = React.useState(false);
 *
 * const handleClickOpen = () => {
 *   setOpen(true);
 * };
 *
 * const handleClose = (value: CloseReason) => {
 *   // this prevents the dialog from closing with a click
 *   // on the background or the escape key.
 *   if (value === 'closeButtonClick') {
 *     setOpen(false);
 *   }
 * };
 *
 * return (
 *  <div>
 *     <Button variant="contained" onClick={handleClickOpen}>
 *       Open Dialog
 *     </Button>
 *
 *     <Dialog
 *       open={open}
 *       onClose={handleClose}
 *       title="Deploy Error"
 *       message={
 *         "An error occurred: Reason: Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos libero quam laborum vero?"
 *       }
 *       buttonText="Got It"
 *     >
 *       <div>I am a child component.</div>
 *     </Dialog>
 *   </div>
 *  );
 * };
 * */
