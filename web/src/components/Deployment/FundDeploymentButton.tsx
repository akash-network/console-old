import * as React from 'react';
import styled from '@emotion/styled';
import { Button, Input } from '@mui/material';
import { Deployment } from '@akashnetwork/akashjs/build/protobuf/akash/deployment/v1beta2/deployment';
import { getAccountBalance } from '../../recoil/api/bank';
import { KeplrWallet } from '../../recoil/atoms';
import { aktToUakt, uaktToAKT } from '../../_helpers/lease-calculations';
import { IconType, Icon } from '../Icons';
import { Prompt } from '../Prompt';
import { useMutation } from 'react-query';
import { fundDeployment } from '../../api/mutations';
import logging from '../../logging';

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

export type FundDeploymentButtonProps = React.PropsWithChildren<{
  icon?: IconType;
  deployment: Deployment;
  wallet: KeplrWallet;
}>;

export const FundDeploymentButton: React.FC<FundDeploymentButtonProps> = ({
  icon,
  deployment,
  wallet,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(0);
  const [balance, setBalance] = React.useState(0);
  const { mutate: mxFundDeployment, isLoading: showProgress } = useMutation(fundDeployment);

  React.useEffect(() => {
    getAccountBalance(wallet.accounts[0].address).then(setBalance);
  }, [wallet]);

  const onButtonClick = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const cleanupState = React.useCallback(() => {
    setOpen(false);
    setAmount(0); // resets the amount between multiple clicks
  }, [setOpen, setAmount]);

  const onCancel = React.useCallback(() => {
    cleanupState();
  }, [cleanupState]);

  const onSend = React.useCallback(async () => {
    const dseq = deployment.deploymentId?.dseq?.toString();

    if (amount !== 0 && dseq !== undefined) {
      mxFundDeployment({ dseq, amount: aktToUakt(amount) }, {
        onSuccess: () => window.location.reload(),
        onError: (err: any) => logging.error(`Unable to send funds to deployment: ${err}`),
      });
    }
  }, [deployment, wallet, amount, cleanupState]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value));
  };

  return (
    <>
      <Button
        fullWidth={true}
        variant="outlined"
        color="secondary"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        sx={{
          justifyContent: 'left',
          gap: '10px',
          backgroundColor: '#FFF1F2',
          color: '#F43F5E',
          border: '1px solid #D1D5DB',
        }}
        onClick={onButtonClick}
      >
        {icon && <Icon type={icon} />}
        {children}
      </Button>
      <Prompt
        title="Add Funds"
        open={open}
        onClose={onCancel}
        showProgress={showProgress}
        actions={[
          { label: 'Cancel', callback: onCancel },
          { label: 'Send', callback: onSend, disabled: amount <= 0 || amount >= balance },
        ]}
      >
        <div>
          <div>How much of {uaktToAKT(balance)} AKT do you want to send?</div>
          <InputContainer>
            <Input type="number" placeholder="5" onChange={handleChange} /> AKT
          </InputContainer>
        </div>
      </Prompt>
    </>
  );
};
