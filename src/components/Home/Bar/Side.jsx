import { useSelector, useDispatch } from "react-redux";
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { authActions } from "../../../redux/auth";
import { motion } from 'framer-motion';
// Import your custom icons
import {
    DashboardIcon,
    AnalysisIcon,
    AiIcon,
    logoutIcon,
    reportIcon,
    settingsIcon,
    solarDetailsIcon,
    SupportIcon,
    AlertIcon
} from '../../icons/icons'; // Adjust the path if necessary

// Define the navigation items configuration with custom icons
const navItems = [
    { to: "/dashboard", icon: DashboardIcon, text: "Dashboard" },
    { to: "/solar-panel-details", icon: solarDetailsIcon, text: "SMB Details" },
    { to: "/analysis", icon: AnalysisIcon, text: "Analysis" },
    { to: "/faults-alerts", icon: AlertIcon, text: "Faults and Alerts" },
    { to: "/maintenance", icon: settingsIcon, text: "Maintenance" },
    { to: "/ai-automation", icon: AiIcon, text: "AI and Automation" },
    { to: "/reports", icon: reportIcon, text: "Reports" },
    { to: "/support", icon: SupportIcon, text: "Support" }
];

/**
 * Side bar component for the application.
 * 
 * It displays a menu with the following items:
 * - Dashboard
 * - Solar Panel Details
 * - Analysis
 * - Faults and Alerts
 * - Maintenance
 * - AI and Automation
 * - Reports
 * - Support
 * - Users Information (only for admin role)
 * - User Settings (only for user role)
 * - Logout
 * 
 * The sidebar is only visible when the user is authenticated.
 * 
 * @returns {JSX.Element} The sidebar component
 */
const Side = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuth = useSelector((state) => state.auth.isAuthenticated);
    const role = useSelector((state) => state.auth.role); // Get the user's role from Redux

    const logoutHandler = () => {
        dispatch(authActions.logout());
        navigate('/'); // Redirect to home after logout
    };

    return (
        isAuth && (
            <div className="fixed top-0 left-0 h-full bg-blue-900 text-white w-64 pl-2 pr-2 shadow-md z-50">
                    <Link to='/dashboard'>
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
                        {navItems.map(({ to, icon, text }) => (
                            <motion.li 
                                key={to}
                                className="mb-2 p-1 rounded-lg flex items-center "
                                whileHover={{ scale: 1.03 , originX: 0}}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <NavLink to={to}  className={({ isActive }) =>  `flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : 'text-white'} outline-none`}>
                                    <img src={icon} alt={text} className="mr-2 h-7 w-7e" />
                                    {text}
                                </NavLink>
                            </motion.li>
                        ))}
                        {role === "admin" && (
                            <motion.li 
                                className="mb-2 p-2 rounded-lg flex items-center"
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <NavLink 
                                    to="/users-information" 
                                    className={({ isActive }) => 
                                        `flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : 'text-white'} outline-none`
                                    }
                                >
                                    <img src={settingsIcon} alt="Users Information" className="mr-2 h-5 w-5" />
                                    Users Information
                                </NavLink>
                            </motion.li>
                        )}
                        {role === "user" && (
                            <motion.li 
                                className="mb-2 p-2 rounded-lg flex items-center"
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <NavLink 
                                    to="/user-settings" 
                                    className={({ isActive }) => 
                                        `flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : 'text-white'} outline-none`
                                    }
                                >
                                    <img src={settingsIcon} alt="User Settings" className="mr-2 h-5 w-5" />
                                    User Settings
                                </NavLink>
                            </motion.li>
                        )}
                        <motion.li 
                            className="mb-2 p-2 rounded-lg flex items-center"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <button onClick={logoutHandler} className="flex items-center w-full text-left px-4 py-2 rounded-lg text-white hover:bg-blue-700 focus:outline-none">
                                <img src={logoutIcon} alt="Logout" className="mr-2 h-5 w-5" />
                                Logout
                            </button>
                        </motion.li>
                    </ul>
                </nav>
            </div>
        )
    );
};

export default Side;
