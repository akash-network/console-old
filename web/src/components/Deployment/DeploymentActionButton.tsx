import React from 'react';
import { Button, Stack, Link, Tooltip, ButtonProps } from '@mui/material';

type DeploymentActionButtonProps = {
  tooltipTitle: string;
  tooltip: React.ReactNode;
  linkTo: string;
  condition: boolean;
  children: React.ReactNode;
} & ButtonProps;

const ConditionalTooltip = ({ children, condition, title, to, sx }: any) => {
  console.log('Condition', condition);

  return condition
    ? <Link href={to} className='w-full'>{children}</Link>
    : <Tooltip title={title} placement="top" sx={sx}><div className='w-full'>{children}</div></Tooltip>;
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
        disabled={!condition}
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