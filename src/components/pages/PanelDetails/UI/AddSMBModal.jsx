/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Typography, FormControl, InputLabel, Select } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AddSMBModal = ({ showModal, handleCloseModal }) => {
  const [plants, setPlants] = useState([]);
  const [selectedPlantName, setSelectedPlantName] = useState('');
  const [smbType, setSMBType] = useState('');
  const [PlantID, setPlantID] = useState('');
  const [InstallationLocation, setInstallationLocation] = useState('');
  const [InstallationDate, setInstallationDate] = useState('');
  const [StringCount, setStringCount] = useState('');
  const [VoltageRating, setVoltageRating] = useState('');
  const [PowerRating, setPowerRating] = useState('');
  const [CurrentRating, setCurrentRating] = useState('');
  const [OperationalStatus, setOperationalStatus] = useState('');
  const [VoltageAlertThreshold, setVoltageAlertThreshold] = useState('');
  const [CurrentAlertThreshold, setCurrentAlertThreshold] = useState('');
  const [WirelessCommunicationProtocol, setWirelessCommunicationProtocol] = useState('');
  const [WiredCommunicationProtocol, setWiredCommunicationProtocol] = useState('');
  const [ipAddress, setIPAddress] = useState('');
  const [portNumber, setPortNumber] = useState('');
  const [ModbusAddress, setModbusAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/solar-plants/");
        setPlants(response.data.plants);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const handlePlantChange = (event) => {
    const selectedId = event.target.value;
    setPlantID(selectedId);
    const selectedPlant = plants.find((plant) => plant.Plant_ID === selectedId);
    setSelectedPlantName(selectedPlant ? selectedPlant.Plant_name : "");
  };

  const handleSMBTypeChange = (event) => {
    setSMBType(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://127.0.0.1:8000/api/smb-register/', {
        plant_id: PlantID,
        smb_type: smbType,
        installation_location: InstallationLocation,
        installation_date: InstallationDate,
        string_count: StringCount,
        voltage_rating: VoltageRating,
        power_rating: PowerRating,
        current_rating: CurrentRating,
        operational_status: OperationalStatus,
        voltage_alert_threshold: VoltageAlertThreshold,
        current_alert_threshold: CurrentAlertThreshold,
        wireless_communication_protocol: WirelessCommunicationProtocol,
        wired_communication_protocol: WiredCommunicationProtocol,
        ip_address: ipAddress,
        port_number: portNumber,
        modbus_address: ModbusAddress
      });
      alert('SMB Registered Successfully');
      handleCloseModal(); // Close modal on successful submission
    } catch (error) {
      console.error('Failed to register SMB', error);
      alert('Failed to register SMB');
    }
  };

  // Framer Motion Variants
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: '-100vh', opacity: 0 },
    visible: {
      y: '0',
      opacity: 1,
      transition: { delay: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white p-8 mt-[500px] md:p-12 rounded-lg shadow-lg w-[1000px]"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            {/* Form Container */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              display="flex"
              flexDirection="column"
              gap={4}
            >
              <Typography variant="h5" component="h2" textAlign="center" mb={2}>
                <h1 className="font-bold">SMB Registration</h1>
              </Typography>

              {/* 2-Column Grid Layout */}
              <Box display="flex" flexWrap="wrap" gap={2}>
                {/* Column 1 */}
                <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    select
                    label="SMB Type"
                    id="SMB_type"
                    name="SMB_type"
                    value={smbType}
                    onChange={handleSMBTypeChange}
                    required
                    margin="dense"
                  >
                    <MenuItem value="" disabled>Select SMB Type</MenuItem>
                    <MenuItem value="SMB_wired">Wired</MenuItem>
                    <MenuItem value="SMB_wireless">Wireless</MenuItem>
                  </TextField>
                </Box>
                <Box flex="1 1 48%">
                <FormControl fullWidth sx={{mt:1}}>
                      <InputLabel id="plant-id-label">Plant-ID *</InputLabel>
                      <Select
                        labelId="plant-id-label"
                        name="Plant_ID"
                        value={PlantID}
                        label="Plant-ID *"
                        onChange={handlePlantChange} // Use the handlePlantChange method
                        required
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200,
                            },
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select PlantID
                        </MenuItem>
                        {plants.map((plant) => (
                          <MenuItem key={plant.Plant_ID} value={plant.Plant_ID}>
                            {plant.Plant_ID}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Installation Location"
                    id="Installation_location"
                    name="Installation_location"
                    value={InstallationLocation}
                    onChange={(e) => setInstallationLocation(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%" sx={{mt:1}}>
                  <TextField
                    fullWidth
                    label="Installation Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    id="Installation_date"
                    name="Installation_date"
                    value={InstallationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    required
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="String Count"
                    type="number"
                    id="String_count"
                    name="String_count"
                    value={StringCount}
                    onChange={(e) => setStringCount(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>

                {/* Column 2 */}
                <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="IP Address"
                    id="IP_Address"
                    name="IP_Address"
                    value={ipAddress}
                    onChange={(e) => setIPAddress(e.target.value)}
                    required
                    margin="dense"
                    disabled={smbType === 'SMB_wireless'} // Disable if wireless
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Port Number"
                    id="Port_number"
                    name="Port_number"
                    value={portNumber}
                    onChange={(e) => setPortNumber(e.target.value)}
                    required
                    margin="dense"
                    disabled={smbType === 'SMB_wireless'} // Disable if wireless
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Modbus Address"
                    id="Modbus_Address"
                    name="Modbus_Address"
                    value={ModbusAddress}
                    onChange={(e) => setModbusAddress(e.target.value)}
                    required
                    margin="dense"
                    disabled={smbType === 'SMB_wireless'} // Disable if wireless
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Voltage Rating"
                    id="Voltage_rating"
                    name="Voltage_rating"
                    value={VoltageRating}
                    onChange={(e) => setVoltageRating(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Current Rating"
                    id="Current_rating"
                    name="Current_rating"
                    value={CurrentRating}
                    onChange={(e) => setCurrentRating(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Power Rating"
                    id="Power_rating"
                    name="Power_rating"
                    value={PowerRating}
                    onChange={(e) => setPowerRating(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Wired Communication Protocol"
                    id="Wired_Communication_Protocol"
                    name="Wired_Communication_Protocol"
                    value={WiredCommunicationProtocol}
                    onChange={(e) => setWiredCommunicationProtocol(e.target.value)}
                    required
                    margin="dense"
                    disabled={smbType === 'SMB_wireless'} // Disable if wireless
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Wireless Communication Protocol"
                    id="Wireless_Communication_Protocol"
                    name="Wireless_Communication_Protocol"
                    value={WirelessCommunicationProtocol}
                    onChange={(e) => setWirelessCommunicationProtocol(e.target.value)}
                    required
                    margin="dense"
                    disabled={smbType === 'SMB_wired'} // Disable if wired
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Operational Status"
                    id="Operational_Status"
                    name="Operational_Status"
                    value={OperationalStatus}
                    onChange={(e) => setOperationalStatus(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Voltage Alert Threshold"
                    id="Voltage_Alert_Threshold"
                    name="Voltage_Alert_Threshold"
                    value={VoltageAlertThreshold}
                    onChange={(e) => setVoltageAlertThreshold(e.target.value)}
                    required
                    margin="dense"
                  />
                  </Box>
                  <Box flex="1 1 48%">
                  <TextField
                    fullWidth
                    label="Current Alert Threshold"
                    id="Current_Alert_Threshold"
                    name="Current_Alert_Threshold"
                    value={CurrentAlertThreshold}
                    onChange={(e) => setCurrentAlertThreshold(e.target.value)}
                    required
                    margin="dense"
                  />
                </Box>
              </Box>
              <div className="flex justify-between">
              <button className="bg-blue-900 hover:bg-blue-500 text-white hover:text-white px-4 py-3 rounded-lg">
                Submit
              </button>
              <button onClick={handleCloseModal} className="bg-red-500 hover:bg-red-600 hover:text-white text-white px-4 py-3 rounded">
                Cancel
              </button>
              </div>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddSMBModal;
