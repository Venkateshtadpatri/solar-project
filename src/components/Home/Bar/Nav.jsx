import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import Login from '../../Auth/Login';
import { motion } from 'framer-motion';
/**
 * A navigation bar component for the home page.
 * 
 * It displays a logo, three links (Home, About, Contact Us), and a login button.
 * When the login button is clicked, a login modal is shown.
 * The modal has a backdrop that can be clicked to close the modal.
 * When the modal is closed, the login button is re-enabled.
 * 
 * @returns {JSX.Element} The navigation bar component
 */

const Nav = () => {
    const [showModal, setShowModal] = useState(false);

    const handleBackdropClick = () => {
        setShowModal(false);
    };

    return (
        <motion.nav className="bg-blue-900 p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center">
                <img 
                    src="/mepstralogo.png"
                    alt="Mepstra Logo" 
                    className="h-10 w-auto mr-4" 
                />
            </div>
            <div className="flex space-x-24">
                <NavLink 
                    to="/" 
                    className="text-white text-xl hover:text-gray-300 flex items-center" 
                >
                    <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
                </NavLink>
                <NavLink 
                    to="/about" 
                    className="text-white text-xl hover:text-gray-300 flex items-center" 
                >
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> About
                </NavLink>
                <NavLink 
                    to="/contact" 
                    className="text-white text-xl hover:text-gray-300 flex items-center" 
                >
                    <FontAwesomeIcon icon={faPhoneAlt} className="mr-1" /> Contact Us
                </NavLink>
            </div>
            <div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-700 font-bold text-white py-2 px-10 drop-shadow rounded hover:bg-blue-600"
                >
                    Login
                </button>
                {showModal && (
                    <Login
                        onClose={handleBackdropClick}
                    />
                )}
            </div>
        </motion.nav>
    );
};

export default Nav;
