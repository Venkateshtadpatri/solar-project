/* eslint-disable react/prop-types */
// components/LocationSelect.js
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * A MUI Select component for selecting a location from a list of options.
 * @param {string} label - The label for the select component.
 * @param {string} value - The currently selected value.
 * @param {function} onChange - The function to call when the user selects a new value.
 * @param {object} options - A list of objects with isoCode and name properties, representing the locations to select from.
 * @param {boolean} disabled - Whether the select component should be disabled.
 * @param {string} labelId - The id for the label element.
 * @returns {JSX.Element} The LocationSelect component.
 */
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
