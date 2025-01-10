import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../Home/Bar/Side';
import SMBTable from './Tables/SMBTable'; // Uncomment these once the components are created.
import PanelTable from './Tables/PanelTable';


const PanelDetails = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('SMB Details'); // State to manage the active component

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
    if (activeTab === 'SMB Details') {
      return <SMBTable />;
    }
    if (activeTab === 'Panel Details') {
      return <PanelTable />;
    }
    return null; // Fallback if neither tab is selected
  };

  return (
    <>
      {isAuth && (
        <div className="relative flex h-screen">
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
            <div className="bg-white w-[400px]  rounded-t-3xl flex justify-start ml-[270px]">
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tl-3xl ${activeTab === 'SMB Details' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('SMB Details')}
                >
                  <div className="mt-2 font-bold text-xl">
                  SMB Details
                  </div>
                </button>
              </div>
              <div className="w-[200px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tr-3xl ${activeTab === 'Panel Details' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Panel Details')}
                >

                  <div className="mt-2 font-bold text-xl">
                  String Details
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

export default PanelDetails;
