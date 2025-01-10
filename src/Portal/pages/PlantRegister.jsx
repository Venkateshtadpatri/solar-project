/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import Sidebar from '../UI/Sidebar';
import LocationSelect from '../UI/LocationSelect';
import { debounce } from 'lodash';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment 
} from "@mui/material";
import { Country, State, City } from 'country-state-city';
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/material.css';
import { motion } from 'framer-motion';
import {Bounce, toast} from "react-toastify";
import { MoonLoader } from 'react-spinners';

const PlantRegister = () => {
  const [PlantName, setPlantName] = useState('');
  const [Address, setAddress] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [PostalCode, setPostalCode] = useState('');
  const [Geolocation, setGeolocation] = useState('');
  const [PrimaryContactName, setPrimaryContactName] = useState('');
  const [PrimaryContactEmail, setPrimaryContactEmail] = useState('');
  const [PrimaryContactPhoneNumber, setPrimaryContactNumber] = useState('');
  const [PrimaryPhoneValid, setPrimaryPhoneValid] = useState(true);
  const [SecondaryContactName, setSecondaryContactName] = useState('');
  const [SecondaryContactEmail, setSecondaryContactEmail] = useState('');
  const [SecondaryContactPhoneNumber, setSecondaryContactNumber] = useState('');
  const [SecondaryPhoneValid, setSecondaryPhoneValid] = useState(true);
  const [TotalStringCount, setTotalStringCount] = useState('');
  const [TotalSMBCount, setTotalSMBCount] = useState('');
  const [TotalPanelCount, setTotalPanelCount] = useState('');
  const [PlantCapacity, setPlantCapacity] = useState('');
  const [LandArea, setLandArea] = useState('');
  const [OperatingHours, setOperatingHours] = useState('');
  const [Status, setStatus] = useState('');

  const [loading, setloading] = useState(false);
  const [fileName, setFileName] = useState('No file selected');
  const [PermitFile, setPermitFile] = useState(null);

  const fileInputRef = useRef(null); // Ref for resetting the file input

  useEffect(() => {
    setPrimaryPhoneValid(PrimaryContactPhoneNumber === "" || /^\d{12}$/.test(PrimaryContactPhoneNumber));
    setSecondaryPhoneValid(SecondaryContactPhoneNumber === "" || /^\d{12}$/.test(SecondaryContactPhoneNumber));
  }, [PrimaryContactPhoneNumber, SecondaryContactPhoneNumber]);

    // Debounced function to load countries
    const fetchCountries = debounce(() => {
        const countryList = Country.getAllCountries();
        setCountries(countryList);
    }, 300); // Delay of 300ms
    
    // Debounced function to load states based on country selection
    const fetchStates = debounce((countryCode) => {
      const stateList = State.getStatesOfCountry(countryCode);
      setStates(stateList);
      setCities([]); // Clear cities when country changes
    }, 300);
    
    // Debounced function to load cities based on state and country selection
    const fetchCities = debounce((countryCode, stateCode) => {
      const cityList = City.getCitiesOfState(countryCode, stateCode);
      setCities(cityList);
    }, 300);
    
    // UseEffect to load countries initially
    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]); // Only run once when the component mounts

    // UseEffect to load states when country changes
    useEffect(() => {
        if (selectedCountry) {
            fetchStates(selectedCountry);
        }
    }, [selectedCountry, fetchStates]); // Trigger when the selected country changes

    // UseEffect to load cities when state changes
    useEffect(() => {
        if (selectedState && selectedCountry) {
            fetchCities(selectedCountry, selectedState);
        }
    }, [selectedState, selectedCountry, fetchCities]); // Trigger when state or country changes

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPermitFile(file);
        setFileName(file.name);
      } else {
        setFileName('No file selected');
      }
    };
  // Intl.NumberFormat for en-IN locale
  const numberFormatter = new Intl.NumberFormat('en-IN', {
    maximumSignificantDigits: 3,
  });

  const handlePlantCapacityChange = (newValue) => {
    setPlantCapacity(newValue);
  };

  const handleLandAreaChange = (value) => {
    setLandArea(value);
  };
  const handleRegister = async (event) => {
    event.preventDefault();
    
    // Create FormData to handle form data and file uploads
    const formData = new FormData();
    formData.append('PlantName', PlantName);
    formData.append('Address', Address);
    formData.append('Country', selectedCountry);
    formData.append('State', selectedState);
    formData.append('City', selectedCity);
    formData.append('Zip/Postal', PostalCode); // Note: Updated to match your backend
    formData.append('Geolocation', Geolocation);
    formData.append('PrimaryContactName', PrimaryContactName);
    formData.append('PrimaryContactPhoneNumber', PrimaryContactPhoneNumber);
    formData.append('PrimaryContactEmail', PrimaryContactEmail);
    formData.append('SecondaryContactName', SecondaryContactName);
    formData.append('SecondaryContactPhoneNumber', SecondaryContactPhoneNumber);
    formData.append('SecondaryContactEmail', SecondaryContactEmail);
    formData.append('TotalSMBCount', TotalSMBCount);
    formData.append('TotalStringCount', TotalStringCount);
    formData.append('TotalPanelCount', TotalPanelCount);
    formData.append('PlantCapacity', PlantCapacity);
    formData.append('LandArea', LandArea);
    formData.append('OperatingHours', OperatingHours);
    formData.append('Status', Status);
  
    // Append the PermitFile if uploaded
    if (PermitFile) {
      formData.append('PermitsFile', PermitFile); // Match this with your backend key
    }
  
    try {
      // Send form data via Axios
      const response = await axios.post('http://127.0.0.1:8000/api/plant-register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      setloading(true);
      toast.success('Solar Plant Registration Successful! Plant ID: ' + response.data.Plant_ID, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
      })
    } catch (error) {
      // Handle error response
      console.error('Registration failed: ', error);
      alert('Error: ' + (error.response?.data.message || error.message));
    }
    finally {
      setloading(false);
      setPlantName('');
      setAddress('');
      setSelectedCity('');
      setSelectedCountry('');
      setSelectedState('');
      setGeolocation('');
      setLandArea('');
      setPlantCapacity('');
      setPostalCode('');
      setSecondaryContactName('')
      setSecondaryContactNumber('')
      setSecondaryContactEmail('');
      setPrimaryContactName('');
      setPrimaryContactNumber('');
      setPrimaryContactEmail('');
      setOperatingHours('');
      setStatus('');
      setTotalSMBCount('');
      setTotalStringCount('');
      setTotalPanelCount('');
      setPermitFile(null);
      setFileName('No file selected');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  useEffect(() => {
    return () => {
      fetchCountries.cancel();
      fetchStates.cancel();
      fetchCities.cancel();
    };
  }, [fetchCountries, fetchStates, fetchCities]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="sticky top-0 h-screen" />
      <motion.div
        className="flex-1 p-6 bg-violet-200 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Container component="main" maxWidth="lg">
          <motion.div
            className="-mt-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 50 }}
          >
            <Card sx={{ maxWidth: '1000px', padding: 4, mt: 4, ml: '200px', mr: 'auto', width: "100%" }}>
              <CardContent>
                <Typography
                  variant="h5"
                  component="div"
                  gutterBottom
                  className="flex justify-center"
                  sx={{ fontWeight: "bold"}}
                >
                  <div className="mb-6">

                  Solar Plant Registration
                  </div>
                </Typography>
                <form onSubmit={handleRegister}> 
                 <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Plant Name"
                        fullWidth
                        variant="outlined"
                        value={PlantName}
                        onChange={(e) => setPlantName(e.target.value)}
                        required
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Address"
                        fullWidth
                        variant='outlined'
                        value={Address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </Box>
                    <Box flex="1 1 48%">
                    <LocationSelect
                      labelId="country-select-id"
                      label="Country"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      options={countries}
                    />
                    </Box>
                    <Box flex="1 1 48%">
                    <LocationSelect
                      labelId="state-select-id"
                      label="State"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      options={states}
                      disabled={!selectedCountry}
                    />
                    </Box>
                    <Box flex="1 1 48%">
                    <LocationSelect
                      labelId="city-select-id"
                      label="City"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      options={cities}
                      disabled={!selectedState}
                    />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Zip/Postal Code"
                        fullWidth
                        variant='outlined'
                        value={PostalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        type="number"
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Geolocation"
                        fullWidth
                        variant='outlined'
                        value={Geolocation}
                        onChange={(e) => setGeolocation(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Primary Contact Name"
                        fullWidth
                        variant='outlined'
                        value={PrimaryContactName}
                        required
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Primary Contact Email"
                        type="email"
                        fullWidth
                        variant='outlined'
                        required
                        value={PrimaryContactEmail}
                        onChange={(e) => setPrimaryContactEmail(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <PhoneInput
                        country={"in"}
                        specialLabel='Primary Contact Number'
                        value={PrimaryContactPhoneNumber}
                        required
                        onChange={(PrimaryContactPhoneNumber) => setPrimaryContactNumber(PrimaryContactPhoneNumber)}
                        inputStyle={{
                          height: "56px", // Adjust to match TextField height
                          width: "100%",
                          paddingLeft: "68px", // Adjust based on design
                          borderRadius: "4px",
                          border: "1px solid #c4c4c4",
                          fontSize: "16px",
                        }}
                      />
                      {PrimaryContactPhoneNumber !== "" && !PrimaryPhoneValid && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Invalid, Please provide a valid 10-digit phone number.
                        </Typography>
                      )}
                    </Box>
                    <Box flex="1 1 48%" >
                      <TextField
                        label="Secondary Contact Name"
                        fullWidth
                        variant='outlined'
                        value={SecondaryContactName}
                        onChange={(e) => setSecondaryContactName(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Secondary Contact Email"
                        type="email"
                        fullWidth
                        variant='outlined'
                        value={SecondaryContactEmail}
                        onChange={(e) => setSecondaryContactEmail(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <PhoneInput
                        country={"in"}
                        specialLabel='Secondary Contact Number'
                        value={SecondaryContactPhoneNumber}
                        onChange={(SecondaryContactPhoneNumber) => setSecondaryContactNumber(SecondaryContactPhoneNumber)}
                        inputStyle={{
                          height: "56px", // Adjust to match TextField height
                          width: "100%",
                          paddingLeft: "68px", // Adjust based on design
                          borderRadius: "4px",
                          border: "1px solid #c4c4c4",
                          fontSize: "16px",
                        }}
                      />
                      {SecondaryContactPhoneNumber !== "" && !SecondaryPhoneValid && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Invalid, Please provide a valid 10-digit phone number.
                        </Typography>
                      )}
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Total SMB Count"
                        fullWidth
                        variant='outlined'
                        value={TotalSMBCount}
                        type="number"
                        required
                        onChange={(e) => setTotalSMBCount(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Total String Count"
                        fullWidth
                        variant='outlined'
                        value={TotalStringCount}
                        type="number"
                        required
                        onChange={(e) => setTotalStringCount(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Total Panel Count"
                        fullWidth
                        variant='outlined'
                        value={TotalPanelCount}
                        type="number"
                        required
                        onChange={(e) => setTotalPanelCount(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Plant Capacity (in KW)"
                        fullWidth
                        variant="outlined"
                        value={PlantCapacity ? numberFormatter.format(PlantCapacity) : ''}
                        onChange={(e) => handlePlantCapacityChange(e.target.value.replace(/[^\d.]/g, ''))} // Filter out non-numeric characters
                        type="text"
                        required
                        slotProps={{
                          input: {
                            endAdornment: <InputAdornment position="end">KW</InputAdornment>,
                          },
                        }}
                      />
                    </Box>

                    <Box flex="1 1 48%">
                      <TextField
                        label="Land Area (in sq.m)"
                        fullWidth
                        variant="outlined"
                        value={LandArea ? numberFormatter.format(LandArea) : ''}
                        onChange={(e) => handleLandAreaChange(e.target.value.replace(/[^\d.]/g, ''))} // Filter out non-numeric characters
                        type="text"
                        required
                        slotProps={{
                          input: {
                            endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                          },
                        }}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                      <TextField
                        label="Operating Hours"
                        fullWidth
                        variant='outlined'
                        value={OperatingHours}
                        type="number"
                        onChange={(e) => setOperatingHours(e.target.value)}
                      />
                    </Box>
                    <Box flex="1 1 48%">
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        name="Status"
                        value={Status}
                        onChange={(e) => setStatus(e.target.value)}
                        variant="outlined"
                        label="Status"
                        className="rounded-lg"
                        required
                        
                      >
                        <MenuItem value="" disabled>
                          Select Status
                        </MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="InActive">InActive</MenuItem>
                      </Select>
                    </FormControl>
                    </Box>
                    <Box flex="1 1 48%">
                    <label
                        htmlFor="Permits"
                        className="font-semibold text-lg my-4 block cursor-pointer"
                      >
                        Permits/Licenses
                        <div className="relative mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-violet-500 transition-colors">
                          <input
                            ref={fileInputRef}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            type="file"
                            title="Permits"
                            id="Permits"
                            onChange={handleFileChange}
                            required
                            className="block absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Click to upload Files</p>
                            <p className="text-xs text-gray-400">(PDF, DOC, DOCX, JPG, PNG)</p>
                            <p className="text-md text-gray-400">Selected File: <span className="text-md text-gray-400">{fileName}</span></p>
                          </div>
                        </div>
                      </label>
                      <Typography variant="caption" className="block mt-2 text-gray-500 text-sm">
                        Upload permit files (PDF, DOC, or image files).
                      </Typography>
                    </Box>
                  </Box>
                  <Box mt={4} ml="400px">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      width="200px"
                    >
                      {loading ? <MoonLoader size={50} color="#ffffff" /> : "Register"}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </motion.div>
    </div>
  );
}

export default PlantRegister;
