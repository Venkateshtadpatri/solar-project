/* eslint-disable react/prop-types */
// components/LocationSelect.js
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const LocationSelect = ({ label, value, onChange, options, disabled, labelId }) => (
  <FormControl fullWidth>
    <InputLabel id={labelId} >{label}</InputLabel>
    <Select labelId={labelId} label={label} value={value} onChange={onChange} disabled={disabled} MenuProps={{PaperProps: {style: { maxHeight: 200,},},}}>
      {options.map((option) => (
        <MenuItem key={option.isoCode || option.name} value={option.isoCode || option.name}>
          {option.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default LocationSelect;
