import { Card, CardContent, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import * as React from 'react';
import { Icon, IconType } from '../Icons';

export interface PlaceholderCardProps {
  icon: IconType;
  title: string;
  children: React.ReactNode;
}

export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ icon, title, children }) => {
  return (
    <Card>
      <CardContent>
        <Stack alignItems="center" justifyContent="center" minHeight="24rem">
          <Box padding="1rem">
            <Icon type={icon} />
          </Box>
          <Typography variant="h3" component="h3">
            {title}
          </Typography>
          <Box textAlign="center">{children}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
