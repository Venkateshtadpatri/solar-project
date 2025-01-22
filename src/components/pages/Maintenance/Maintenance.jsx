import { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../Home/Bar/Side';
import UpComingMaintenance from './Tables/UpComingMaintenance';
import MaintenanceHistory from './Tables/MaintenanceHistory';
/**
 * Maintenance component
 * 
 * This component renders the Maintenance page only if the user is authenticated.
 * Otherwise, it redirects to the home page.
 * 
 * It renders a sidebar and a main content area. The main content area shows a heading
 * with the text "Maintenance Page".
 */
const Maintenance = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('UpComing Maintenance');

  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);
  
  const pageVariants = {
    initial: { opacity: 0},  // Start hidden and to the right
    animate: { opacity: 1},    // Fade in and slide to position
    exit: { opacity: 0 }     // Fade out and slide out to the left
  };
  const renderActiveComponent = () => {
    if (activeTab === 'UpComing Maintenance') {
      return <UpComingMaintenance />;
    }
    if (activeTab === 'Maintenance History') {
      return <MaintenanceHistory />;
    }
    return null;
  }
  return (
    <>
    {isAuth && (
      <div className="flex h-screen">
        {/* Navbar as Sidebar */}
          <Side />
        {/* Main Content */}
        <motion.div 
          className="flex-1 p-6 bg-blue-100 flex flex-col justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
           {/* Container for the tabs and content */}
            {/* Tab Navigation */}
            <div className="bg-white w-[500px]  rounded-t-3xl flex justify-start -ml-[440px]">
              <div className="w-[500px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tl-3xl ${activeTab === 'UpComing Maintenance' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('UpComing Maintenance')}
                >
                  <div className="mt-2 font-bold text-md">
                  UpComing Maintenance
                  </div>
                </button>
              </div>
              <div className="w-[500px] h-[60px] rounded-t-3xl bg-white">
                <button
                  className={`px-4 w-full h-full flex justify-center py-2 rounded-tr-3xl ${activeTab === 'Maintenance History' ? 'bg-indigo-500 text-white' : 'bg-white text-black'}`}
                  onClick={() => setActiveTab('Maintenance History')}
                >
                  <div className="mt-2 font-bold text-xl">
                  Maintenance History
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
}

export default Maintenance