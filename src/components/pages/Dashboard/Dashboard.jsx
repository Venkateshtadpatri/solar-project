/* eslint-disable react-hooks/exhaustive-deps */
 
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from "../../../redux/auth";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DigitalClock from "./UI/DigitalClock.jsx";
import Side from '../../../components/Home/Bar/Side';
import Card from './UI/Card';
import AlertsTable from './UI/AlertsTable';
import TotalEnergyChart from './UI/TotalEnergyChart';

// Variants for card animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Delay based on index
      duration: 0.4,
    },
  }),
};

/**
 * Dashboard component
 *
 * This component displays a dashboard with overview cards, alerts, and energy chart.
 * It fetches data from a backend API and updates every 10 seconds.
 * It renders a digital clock for live timestamp and a dropdown menu for user settings.
 * It uses the `useSelector` hook to access authentication state and plant ID.
 * It redirects to home if the user is not authenticated.
 * It defines an `handleToggleClick` function to toggle dropdown visibility.
 * It renders the active component inside the content area.
 *
 * @returns {JSX.Element} The Dashboard component.
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const user_id = useSelector((state) => state.auth.user_id);
  const navigate = useNavigate();
  
  const [toggle, setToggle] = useState(false);
  const [data, setData] = useState({
    solar_power_plant_efficiency: "N/A",
    total_energy_generated: "N/A",
    total_energy_produced: "N/A"
  });
  const [SMBCount, setSMBCount] = useState('');

  const fetchData = async () => {
    try {
  /**
   * Fetches solar plant data from the backend API and updates the `data` state.
   *
   * This asynchronous function makes a GET request to the backend API to retrieve
   * a JSON object with three properties, 'solar_power_plant_efficiency', 'total_energy_generated',
   * and 'total_energy_produced'. Upon a successful request, the `data` state is updated
   * with the data received. If the request fails, an error message is logged to the console.
   *
   * @returns {Promise<void>} A promise that resolves when data fetching is complete.
   */
      const response = await axios.get('http://127.0.0.1:8000/api/solar_plant_data/');
      setData(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  /**
   * Fetches the SMB count for a given plant ID from the backend API and
   * updates the `SMBCount` state.
   *
   * This asynchronous function makes a GET request to the backend API to retrieve
   * the SMB count associated with the currently selected PlantId. Upon a successful
   * request, the `SMBCount` state is updated with the data received. If the request
   * fails, an error message is logged to the console.
   *
   * @returns {Promise<void>} A promise that resolves when data fetching is complete.
   */
  const fetchSMBCount = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get-details/${PlantId}`);
      setSMBCount(response.data.data.SMBCount);
    } catch (error) {
      console.error("Error", error);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchData();
      fetchSMBCount();
      const interval = setInterval(fetchData, 10000); 
      const interval2 = setInterval(fetchSMBCount, 10000);
      return () => {
        clearInterval(interval);
        clearInterval(interval2);
      };
    }
  }, [isAuth, navigate]);

/**
 * Handles user logout by dispatching the logout action and
 * redirecting the user to the home page.
 */

  const logoutHandler = () => {
    dispatch(authActions.logout());
    navigate('/'); // Redirect to home after logout
  };
  
  const handleToggleClick = () => setToggle((prev) => !prev); // Toggle dropdown visibility

  return (
    <>
      {isAuth && (
        <div className="flex h-screen">
          <Side />
          <AnimatePresence>
            <motion.div
              className="flex-1 p-6 bg-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-row justify-end">
                  <div className="live-dot ml-4" />
                <div className="text-base flex flex-row font-bold mb-4 gap-2 bg-blue-900 text-white p-2 rounded-xl">
                  <div className="text-white">
                    Live TimeStamp: <DigitalClock />
                  </div>
                </div>
                <ul className="flex flex-row justify-end items-center relative">
                  <li>
                    <div
                      onClick={handleToggleClick}
                      className="flex items-center cursor-pointer text-xl p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={toggle}
                    >
                      <span>Hello, {user_id}</span>
                      <span className="ml-2 text-xs">
                        {toggle ? '▲' : '▼'}
                      </span>
                    </div>
                    {toggle && (
                      <ul
                        className="absolute right-0 w-[150px] bg-white shadow-lg rounded-md mt-2 z-10 border border-gray-200"
                        role="menu"
                        aria-label="User menu"
                      >
                        <li>
                          <button
                            className="block px-4 py-2 text-left w-full text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => navigate('/settings')}
                            role="menuitem"
                          >
                            Settings
                          </button>
                        </li>
                        <li>
                          <button
                            className="block px-4 py-2 text-left w-full text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={logoutHandler}
                            role="menuitem"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                </ul>
              </div>

              {/* Overview Cards */}
              <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-64 mb-5">
                {[
                  { title: "Solar Plant Efficiency", value: data.solar_power_plant_efficiency, unit: "%", color: "#6D59EB" },
                  { title: "Today's Energy Generated", value: data.total_energy_generated, unit: "KWh", color: "#59D0EB" },
                  { title: "Total Energy Produced", value: data.total_energy_produced, unit: "KWh", color: "#5974EB" },
                  { title: "SMB Count", value: SMBCount, color: "#A7B4EB" }, // Use SMBCount from state
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <Card title={card.title} value={card.value} unit={card.unit} color={card.color} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Alerts and Energy Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 ml-64">
                <AlertsTable />
                <TotalEnergyChart />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Dashboard;
