import styled from '@emotion/styled';
import { Button, Dialog, DialogProps, CircularProgress } from '@mui/material';
import * as React from 'react';

const PromptDialog = styled(Dialog)`
  & .MuiPaper-rounded {
    border-radius: 16px;
  }
`;

const PromptHeader = styled.h1`
  font-size: 24px;
  font-weight: 500;
  font-family: 'Satoshi-Regular', sans-serif;
  line-height: 32px;
  text-align: center;
  margin-bottom: 16px;
`;

const PromptBody = styled.div`
  margin: 32px 39px;
`;

const PromptFooter = styled.div`
  display: flex;
  flex-direction: row;

  & > button {
    flex-grow: 1;
    padding: 16px;
    font-size: 14px;
    text-transform: none;
  }
`;

const PromptProgress = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  padding: 16px;
`;

export type PromptProps = React.PropsWithChildren<
  {
    title?: string;
    showProgress: boolean;
    actions: {
      label: string;
      callback: () => void;
      disabled?: boolean;
    }[];
  } & DialogProps
>;

export const Prompt: React.FC<PromptProps> = ({
  title,
  showProgress,
  children,
  actions,
  ...rest
}) => {
  return (
    <PromptDialog {...rest}>
      <PromptBody>
        {title && <PromptHeader>{title}</PromptHeader>}
        {children}
      </PromptBody>
      <div>
        {showProgress ? (
          <PromptProgress>
            <CircularProgress />
          </PromptProgress>
        ) : (
          <PromptFooter>
            {actions &&
              actions.map(({ label, callback, disabled }) => (
                <Button
                  key={`prompt-action-${label.toLocaleLowerCase()}`}
                  onClick={callback}
                  disabled={disabled}
                >
                  {label}
                </Button>
              ))}
          </PromptFooter>
        )}
      </div>
    </PromptDialog>
  );
};
