import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './UI/Sidebar';
import CountUp from 'react-countup';

const AccessPortal = () => {
  const navigate = useNavigate();
  // const adminCount = 150; // Example data
  const plantCount = 75; // Example data

  // const handleAdminClick = () => {
  //   navigate('/access-portal/admin-registration/view-admin-list');
  // }
  const handlePlantClick = () => {
    navigate('/access-portal/plant-registration/view-plant-list')
  }
  // const handleAdminRegisterClick = () => {
  //   navigate('/access-portal/admin-registration/admin-register');
  // }
  const handlePlantRegisterClick = () => {
    navigate('/access-portal/plant-registration/plant-register')
  }

  return (
    <AnimatePresence>
      <div className="flex h-screen">
        {/* Navbar as Sidebar */}
          <Sidebar />
        {/* Main Content */}
        <motion.div 
          className="flex-1 p-6 bg-violet-200 flex flex-col justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="ml-36">
          <h1 className="text-3xl ml-36 font-bold mb-6">Welcome to Access Portal</h1>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Admin Count Card */}
            {/* <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold">Admin Count</h2>
              <div className="font-bold text-3xl">
              <CountUp start={0} end={adminCount} duration={2} /> +
              </div>
              <button onClick={handleAdminClick} className="mt-4 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition duration-200">
                View
              </button>
            </div> */}

            {/* Plant Count Card */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold">Plant Count</h2>
              <div className="font-bold text-3xl">
              <CountUp start={0} end={plantCount} duration={2} /> +
              </div>
              <button onClick={handlePlantClick} className="mt-4 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition duration-200">
                View
              </button>
            </div>

            {/* Admin Register Card */}
            {/* <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold">Admin Register</h2>
              <p className="text-center">Register a new admin to manage the portal.</p>
              <button onClick={handleAdminRegisterClick} className="mt-4 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition duration-200">
                Register
              </button>
            </div> */}

            {/* Plant Register Card */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold">Plant Register</h2>
              <p className="text-center">Register a new plant for monitoring.</p>
              <button onClick={handlePlantRegisterClick} className="mt-4 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition duration-200">
                Register
              </button>
            </div>
          </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AccessPortal;
