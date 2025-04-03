// UserInformation.js
import {useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../../components/Home/Bar/Side';
import ReportGeneration from './Tabs/ReportGeneration';
import ReportList from './Tabs/ReportList';
import axios from "axios";

/**
 * Reports component:
 *
 * This component renders a page with two tabs, 'Report Generation' and 'Report List'.
 * It uses the `useSelector` hook to check if the user is authenticated and redirect to
 * the home page if not.
 * It uses the `useState` hook to manage the active tab state.
 * It defines an `renderActiveComponent` function to render the active component based
 * on the activeTab state.
 * It uses the `AnimatePresence` component from Framer Motion to animate the tab content.
 * It renders the tab navigation and content area with a container for the tabs and
 * content.
 * It renders the active component inside the content area.
 */

const Reports = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [PlantName, setPlantName] = useState('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Report Generation'); // State to manage the active component

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);

  useEffect(() => {
  /**
   * Fetches the plant name from the backend API based on the currently selected
   * PlantId.
   *
   * This function makes a GET request to the backend API to fetch the plant name
   * associated with the current PlantId. If the request is successful, it sets
   * the `PlantName` state to the response data.
   *
   * @returns {Promise<void>} A promise that resolves when the plant name is fetched.
   */
    const fetchPlantDetails = async () => {
      if (!PlantId) return; // Don't fetch if no PlantId is selected

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get-details/${PlantId}/`);
        setPlantName(response.data.data.PlantName); // Set plant details
      } catch (error) {
        console.error("Error fetching plant name:", error);
      }
    };
    fetchPlantDetails().then(() => {});
  }, [PlantId]);
  // Animations for tab content
  const pageVariants = {
    initial: { opacity: 0},  // Start hidden and to the right
    animate: { opacity: 1},    // Fade in and slide to position
    exit: { opacity: 0 }     // Fade out and slide out to the left
  };

  // Function to render the active component based on the activeTab state
  const renderActiveComponent = () => {
    if (activeTab === 'Report Generation') {
      return <ReportGeneration isAuth={isAuth} PlantName={PlantName} />;
    }
    if (activeTab === 'Report List') {
      return <ReportList isAuth={isAuth} />;
    }
    return null; // Fallback if neither tab is selected
  };
  return (
    <>
      {isAuth && (
        <div className="flex h-screen">
           {/* Navbar as Sidebar */}
          <Side />
           {/* Main Content */}
          <motion.div
            className="flex-1 p-6 bg-blue-100 flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
             {/* Container for the tabs and content */}
            {/* Tab Navigation */}
            <div className="bg-white w-[400px] rounded-t-3xl flex justify-start ml-[270px]">
              <div className="w-[300px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tl-3xl ${activeTab === 'Report Generation' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Report Generation')}
                >
                  <div className="mt-2 font-bold text-xl">
                  Report Generation
                  </div>
                </button>
              </div>
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tr-3xl ${activeTab === 'Report List' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Report List')}
                >
                  <div className="mt-2 font-bold text-xl">
                  Report List
                  </div>
                </button>
              </div>
            </div>

            <div className="ml-[250px] w-[1240px] h-[600px] bg-white rounded-2xl p-4">
              {/* Content Area */}
              <div className="w-full h-full p-1">
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeTab}  // Key changes with activeTab, triggering exit and enter animations
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}  // Adjust duration for smoother transitions
                    className="w-full h-full"
                  >
                    {renderActiveComponent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Reports;
