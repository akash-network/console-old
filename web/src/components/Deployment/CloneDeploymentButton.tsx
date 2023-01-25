import * as React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { KeplrWallet } from '../../recoil/atoms';
import { IconType, Icon } from '../Icons';
import { Prompt } from '../Prompt';

export type CloneDeploymentButtonProps = React.PropsWithChildren<
  {
    icon?: IconType;
    deployment: Deployment;
    wallet: KeplrWallet;
  } & ButtonProps
>;

export const CloneDeploymentButton: React.FC<CloneDeploymentButtonProps> = ({
  icon,
  deployment,
  wallet,
  children,
  ...rest
}) => {
  const [open, setOpen] = React.useState(false);
  const [showProgress, setShowProgress] = React.useState(false);

  const onButtonClick = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const cleanupState = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onCancel = React.useCallback(() => {
    cleanupState();
  }, [cleanupState]);

  const onSend = React.useCallback(async () => {
    setShowProgress(true);
  }, [cleanupState]);

  return (
    <>
      <Button
        fullWidth={true}
        variant="outlined"
        color="secondary"
        aria-label="clone deployment"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        sx={{
          justifyContent: 'left',
          gap: '10px',
          backgroundColor: '#FFFFFF',
          color: '#374151',
          border: '1px solid #D1D5DB',
        }}
        onClick={onButtonClick}
        {...rest}
      >
        {icon && <Icon type={icon} />}
        {children}
      </Button>

      <Prompt
        title="Clone Deployment"
        open={open}
        onClose={onCancel}
        showProgress={showProgress}
        actions={[
          { label: 'Cancel', callback: onCancel },
          {
            label: 'Clone',
            callback: onSend,
          },
        ]}
      >
        <div>
          <div>
            Are you sure you want to clone deployment ({deployment.deploymentId?.dseq.toString()})?
          </div>
        </div>
      </Prompt>
    </>
  );
};
