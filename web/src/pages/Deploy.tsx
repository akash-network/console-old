import React from 'react';
import pkg from '../../package.json';
import ProfileMenu from '../components/ProfileMenu';
import { Box, Stack, Typography } from '@mui/material';
import Logo from '../assets/images/akash-logo-text.png';
import { Link } from 'react-router-dom';

export default function DeployPage() {
  const [user] = React.useState('Flavio Espinoza'); // @fix : feed in user full name in through props
  const [currentYear] = React.useState(new Date().getFullYear());

  return (
    <div className="container">
      <Box>
        <Stack justifyContent="space-between" spacing={4}>
          <div className="flex mt-8">
            <Link to="/landing">
              <img className="flex-1" src={Logo} width={240} />
            </Link>
            <div className="grow">{/* flex grow spacer */}</div>

            <div className="flex-none">
              <ProfileMenu user={user} />
            </div>
          </div>
          <div className="akt-card"></div>
        </Stack>
      </Box>
      <Typography variant="caption" align="center" component="p" mt={2}>
        © {currentYear} Overclock Labs, Inc. All Rights Reserved <br />
        Version {pkg.version}
      </Typography>
    </div>
  );
}
