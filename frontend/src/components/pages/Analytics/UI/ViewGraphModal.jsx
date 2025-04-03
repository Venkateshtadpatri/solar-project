/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Button, DialogActions, DialogContent, DialogTitle, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';


/**
 * A modal component that displays a graph for the given SMB ID and frequency.
 *
 * The graph will be updated every 10 seconds with the latest data.
 *
 * @param {boolean} showModal Whether the modal should be shown or not.
 * @param {function} handleCloseModal Function to call when the modal is closed.
 * @param {number} smbId The ID of the SMB to fetch the data for.
 * @param {number} PlantId The ID of the plant to fetch the data for.
 *
 * @returns {ReactElement} The modal component.
 */
const ViewGraphModal = ({ showModal, handleCloseModal, smbId, PlantId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('Daily');

  /**
   * Fetches the graph data for the given SMB ID and frequency.
   *
   * This function makes a GET request to the backend API to fetch the graph data
   * for the given SMB ID and frequency. It will return early if the SMB ID is not
   * provided. If the request is successful, it will update the chartData state with
   * the received data. If the request fails or there is no data available, it will
   * set the error state to an appropriate error message.
   *
   * */
  const fetchGraphData = async () => {
    if (!smbId) {
      // Return early if smbId is not provided
      setError('SMB ID is required to fetch the data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/analytics/${PlantId}/${smbId}/`);
      if (response.data?.status === 'success' && response.data.generated_data) {
        setChartData(response.data?.generated_data);
      } else {
        setError('No data available for this SMB ID and frequency.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal && smbId) {
      fetchGraphData();
    }
  }, [showModal, smbId, selectedFrequency]);

  useEffect(() => {
    if (smbId) {
      fetchGraphData(); // Fetch data when component mounts if smbId is provided
      const interval = setInterval(fetchGraphData, 10000); // Fetch data every 10 seconds
      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [smbId]);

  /**
   * Formats the chart data for the given frequency by combining real-time and expected data.
   *
   * This function takes the chart data object and the selected frequency as input.
   * It will return an array of objects with the following properties:
   * - time_key: The time key for the data point
   * - real_time_energy_kwh: The real-time energy data for the given frequency
   * - expected_energy_kwh: The expected energy data for the given frequency
   * - real_time_temperature: The real-time temperature data for the given frequency
   * - expected_temperature: The expected temperature data for the given frequency
   *
   * If the selected frequency is not available in the chart data, this function will return an empty array.
   *
   * @returns {array} The formatted chart data array.
   */
  const formatChartData = () => {
    const realTimeData = chartData.real_time_data?.[selectedFrequency];
    const expectedData = chartData.expected_data?.[selectedFrequency];
  
    // Check if both datasets are available
    if (!Array.isArray(realTimeData) || !Array.isArray(expectedData)) {
      console.error("Missing data for the selected frequency:", selectedFrequency);
      return [];
    }
  
    // Combine real-time and expected data
    const combinedData = realTimeData.map((dataPoint, index) => ({
      time_key: dataPoint.time,
      real_time_energy_kwh: dataPoint.energy,
      expected_energy_kwh: expectedData[index]?.energy || 0, // Fallback to 0 if expected data is missing
      real_time_temperature: dataPoint.temperature || 0, // Add temperature data for real-time
      expected_temperature: expectedData[index]?.temperature || 0, // Add temperature data for expected
    }));
  
    return combinedData;
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
          <motion.div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: '-100vh', opacity: 0 }} animate={{ y: '0', opacity: 1 }}>

            <DialogTitle className="text-3xl font-bold mb-8 text-center">
                <div className="flex justify-center items-center gap-10">
                        <div>Graph for SMB ID: {smbId}</div>
                        <div className='ml-[400px]'>

                            <FormControl style={{width: '200px'}} className="mb-10">
                                <InputLabel id="frequency-label">Frequency</InputLabel>
                                <Select labelId="frequency-label" label="frequency-label" value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}>
                                <MenuItem value="Daily">Daily</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Yearly">Yearly</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                </div>

            </DialogTitle>
            <DialogContent dividers>

              {loading ? (
                <div className="flex justify-center items-center"><CircularProgress /></div>
              ) : error ? (
                <div className="text-center text-xl text-red-500">{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time_key">
                        <Label value="Time" offset={-6} position="bottom" style={{ fill: 'black', color: 'black', marginTop: '20px', paddingBottom: '10px' }}  />
                    </XAxis>
                    <YAxis>
                        <Label value="Energy (Kwh)" angle={-90} position="left" style={{ textAnchor: 'middle', fill: 'black', marginTop: '20px' }} offset={-10} />
                    </YAxis>
                    <Tooltip 
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const { real_time_energy_kwh, expected_energy_kwh, time_key, real_time_temperature, expected_temperature } = payload[0].payload;
                        return (
                          <div className="bg-white p-2 rounded-lg shadow-md">
                            <p><strong>Time:</strong> {time_key}</p>
                            <p><strong>Real-Time Energy:</strong> {real_time_energy_kwh} kWh</p>
                            <p><strong>Real-Time Temperature:</strong> {real_time_temperature} °C</p>
                            <p><strong>Expected Energy:</strong> {expected_energy_kwh} kWh</p>
                            <p><strong>Expected Temperature:</strong> {expected_temperature} °C</p>
                          </div>
                        );
                      }}
                    />
                    {/* Line for Real-time data */}
                    <Line type="monotone" dataKey="real_time_energy_kwh" stroke="#8884d8" />
                    {/* Line for Expected data */}
                    <Line type="monotone" dataKey="expected_energy_kwh" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} variant="contained" color="error">Close</Button>
            </DialogActions>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ViewGraphModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  smbId: PropTypes.string,
  frequency: PropTypes.string.isRequired,
  PlantId: PropTypes.string.isRequired,
};

export default ViewGraphModal;
