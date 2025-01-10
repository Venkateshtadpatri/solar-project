/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isPlantOpen, setPlantOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  
  const location = useLocation(); // Get the current location

  // Update dropdown state based on current path
  useEffect(() => {
    if (location.pathname.includes('/plant-registration')) {
      setPlantOpen(true);
    } else {
      setPlantOpen(false);
    }

    if (location.pathname.includes('/admin-registration')) {
      setAdminOpen(true);
    } else {
      setAdminOpen(false);
    }
  }, [location.pathname]);

  const togglePlantMenu = () => setPlantOpen(!isPlantOpen);
  const toggleAdminMenu = () => setAdminOpen(!isAdminOpen);

  return (
    <div 
      className="absolute mt-4 ml-4 rounded-xl h-[670px] bg-violet-900 text-white w-[270px] pl-2 pr-2 shadow-md z-10"
    >
      <Link to='/access-portal'>
        <div className="p-4 flex justify-center items-center">
          <img 
            src="/mepstralogo.png"
            alt="Mepstra Logo" 
            className="h-12 w-auto" 
          />
        </div>
      </Link>
      <nav className="mt-4">
        <ul>
          {/* Plant Registrations Section */}
          <li className="mb-2">
            <div onClick={togglePlantMenu} className="flex items-center cursor-pointer text-xl p-2 rounded-lg hover:bg-violet-700">
              <span>Plant Registrations</span>
              <span className="ml-auto text-xs"> {/* Change font size here */}
                {isPlantOpen ? '▲' : '▼'}
              </span>
            </div>
            {isPlantOpen && (
              <ul className="ml-4">
                <motion.li
                  whileHover={{ scale: 1.03, originX: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink 
                    to="/access-portal/plant-registration/view-plant-list" 
                    className={({ isActive }) =>  
                      `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                    }
                  >
                    View Plant List
                  </NavLink>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.03, originX: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink 
                    to="/access-portal/plant-registration/plant-register" 
                    className={({ isActive }) =>  
                      `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                    }
                  >
                    Register New Plant
                  </NavLink>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.03, originX: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink 
                    to="/access-portal/plant-registration/view-plant-layout" 
                    className={({ isActive }) =>  
                      `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                    }
                  >
                    View Plant Layout
                  </NavLink>
                  <NavLink
                      to="/access-portal/plant-registration/view-weather-data"
                      className={({ isActive }) =>
                          `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                      }
                  >
                    View Weather Data
                  </NavLink>
                </motion.li>
              </ul>
            )}
          </li>

          {/* Admin Registrations Section */}
          <li className="mb-2">
            <div onClick={toggleAdminMenu} className="flex items-center cursor-pointer text-xl p-2 rounded-lg hover:bg-violet-700">
              <span>Admin Registrations</span>
              <span className="ml-auto text-xs"> {/* Change font size here */}
                {isAdminOpen ? '▲' : '▼'}
              </span>
             </div>
            {isAdminOpen && (
              <ul className="ml-4">
                <motion.li
                  whileHover={{ scale: 1.03, originX: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink
                    to="/access-portal/admin-registration/view-admin-list"
                  className={({ isActive }) =>
                      `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                    }
                  >
                    View Admin List
                   </NavLink>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.03, originX: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <NavLink
                    to="/access-portal/admin-registration/admin-register"
                    className={({ isActive }) =>
                       `flex items-center text-lg px-2 py-1 w-[230px] rounded-lg transition-colors duration-300 
                      ${isActive ? 'bg-violet-600 text-white' : 'text-white'} 
                      hover:bg-violet-700 outline-none`
                    }
                  >
                    Register New Admin
                  </NavLink>
                </motion.li>
              </ul>
            )}
          </li>
        </ul> 
      </nav>
    </div>
  );
};

export default Sidebar;
