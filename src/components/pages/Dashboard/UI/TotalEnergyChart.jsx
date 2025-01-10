/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line, Label } from 'recharts';

const TotalEnergyChart = ({ initialTimePeriod = 'Daily', initialChartData = { Daily: [], Weekly: [], Monthly: [], Yearly: [] } }) => {
  const [timePeriod, setTimePeriod] = useState(initialTimePeriod); // Set default to 'Daily'
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(false); // To track loading state
  const [error, setError] = useState(null); // To track errors

  // Fetch energy data from the backend
  const fetchEnergyData = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/energy/'); // Adjust the URL based on your API endpoint
      if (response.data && response.data.energy_data) {
        setChartData(response.data.energy_data); // Update the chartData object with the fetched data
      } else {
        console.error('Error fetching data:', response.data.error);
        setError('Error fetching data.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error fetching data.');
    } finally {
      setLoading(false); // Stop loading after fetch attempt
    }
  };

  useEffect(() => {
    fetchEnergyData(); // Fetch data when component mounts
    const interval = setInterval(fetchEnergyData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  // Update chart data when timePeriod changes
  const currentData = chartData[timePeriod] || [];

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 w-[800px] shadow-md rounded-2xl p-4" style={{ marginLeft: '-190px', height: '450px' }}>
      <div className="mb-4 flex flex-row justify-between items-center">
        <h3 className="text-2xl font-semibold">Total Energy Generated</h3>
        <select
          value={timePeriod}
          onChange={(e) => {
            setTimePeriod(e.target.value);
          }}
          className="p-2 border border-gray-300 bg-blue-900 text-white rounded-3xl h-15"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-xl">Loading...</div>
      ) : error ? (
        <div className="text-center text-xl text-red-500">{error}</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          {timePeriod === 'Daily' ? (
            <BarChart data={currentData} margin={{ top: 20, right: 20, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time">
                <Label value="Time" offset={15} position="bottom" style={{ fill: 'black' }} />
              </XAxis>
              <YAxis>
                <Label value="Energy (Kwh)" angle={-90} position="left" style={{ textAnchor: 'middle', fill: 'black' }} offset={15} />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: 'black', color: 'black' }} />
              <Bar dataKey="energy" fill="#A7B4EB" barSize={40} />
            </BarChart>
          ) : (
            <LineChart data={currentData} margin={{ top: 20, right: 20, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time">
                <Label value="Time" offset={15} position="bottom" style={{ fill: 'black', color: 'black' }} />
              </XAxis>
              <YAxis>
                <Label value="Energy (Kwh)" angle={-90} position="left" style={{ textAnchor: 'middle', fill: 'black' }} offset={15} />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: 'black', color: 'black' }} />
              <Line type="monotone" dataKey="energy" stroke="#003366" strokeWidth={3} />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TotalEnergyChart;
