import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Chip from '@mui/material/Chip';

export default function SelectLabels(props: any) {
  const [networkSelection, setNetworkSelection] = React.useState('mainnet3');

  const handleChange = (event: SelectChangeEvent) => {
    setNetworkSelection(event.target.value);
  };

  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 120, ...props.sx }}>
        <InputLabel id="network-selector-label">Network</InputLabel>
        <Select
          labelId="network-selector-label"
          id="network-selector"
          value={networkSelection}
          label="Network"
          onChange={handleChange}
        >
          <MenuItem value="mainnet3">
            <div style={{ display: 'inline-block', width: '100px' }}>Production</div>
            <Chip color="primary" label="MainNet" variant="outlined" />
          </MenuItem>
          <MenuItem value="testnet3">
            <div style={{ display: 'inline-block', width: '100px' }}>Development</div>
            <Chip color="primary" label="TestNet" variant="outlined" sx={{ marginLeft: '5px' }} />
          </MenuItem>
        </Select>
        <FormHelperText>Select a Network to Deploy.</FormHelperText>
      </FormControl>
    </>
  );
}
