import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../Home/Bar/Side';
import { ColorAlertIcon, ActiveAlertIcon } from '../../icons/icons';
import ActiveAlerts from './Tables/ActiveAlerts'; // Uncomment these once the components are created.
import AlertHistory from './Tables/AlertHistory';

/**
 * FaultsAndAlerts component
 * 
 * This component renders the Faults and Alerts page only if the user is authenticated.
 * Otherwise, it redirects to the home page.
 * 
 * It renders a sidebar and a main content area. The main content area shows a heading
 * with the text "Faults and Alerts Page".
 * 
 * @returns {JSX.Element} The Faults and Alerts page component.
 */
const FaultsAndAlerts = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active Alerts'); // State to manage the active component

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);

  // Animations for tab content
  const pageVariants = {
    initial: { opacity: 0},  // Start hidden and to the right
    animate: { opacity: 1},    // Fade in and slide to position
    exit: { opacity: 0 }     // Fade out and slide out to the left
  };

  // Function to render the active component based on the activeTab state
  const renderActiveComponent = () => {
    if (activeTab === 'Active Alerts') {
      return <ActiveAlerts />;
    }
    if (activeTab === 'Alert History') {
      return <AlertHistory />;
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
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tl-3xl ${activeTab === 'Active Alerts' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Active Alerts')}
                >
                  <img src={ActiveAlertIcon} alt="active alert icon" className="w-7 h-7 mr-2 mt-2" />
                  <div className="mt-2 font-bold text-xl">
                  Active Alerts
                  </div>
                </button>
              </div>
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tr-3xl ${activeTab === 'Alert History' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Alert History')}
                >
                  <img src={ColorAlertIcon} alt="alert History icon" className="w-7 h-7 mr-2 mt-2" />
                  <div className="mt-2 font-bold text-xl">
                  Alert History
                  </div>
                </button>
              </div>
            </div>

            <div className="ml-[250px] w-[1240px] h-[640px] bg-white rounded-2xl p-4">
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

export default FaultsAndAlerts;
