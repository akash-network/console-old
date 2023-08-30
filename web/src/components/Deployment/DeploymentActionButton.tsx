import React from 'react';
import { Button, Stack, Link, Tooltip, ButtonProps } from '@mui/material';

type DeploymentActionButtonProps = {
  tooltipTitle: string;
  tooltip: React.ReactNode;
  linkTo: string;
  condition: boolean;
  children: React.ReactNode;
} & ButtonProps;

const ConditionalTooltip = ({ children, condition, ...rest }: any) => {
  return condition
    ? <Link {...rest}>{children}</Link>
    : <Tooltip {...rest} placement="top">{children}</Tooltip>;
};


const DeploymentActionButton: React.FC<DeploymentActionButtonProps> = (props) => {
  const {
    tooltipTitle,
    tooltip,
    linkTo,
    children,
    condition,
    ...rest
  } = props;

  return <Stack direction="row" spacing={1} alignItems="center">
    <ConditionalTooltip
      title={tooltipTitle}
      to={linkTo}
      className="grow"
      condition={condition}
    >
      <Button
        fullWidth
        variant="outlined"
        color="secondary"
        sx={{
          justifyContent: 'left'
        }}
        {...rest}
      >
        {children}
      </Button>
    </ConditionalTooltip>
    {tooltip}
  </Stack>;
};

export default DeploymentActionButton;