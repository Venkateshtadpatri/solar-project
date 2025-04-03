/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { TextField, Button, Typography } from '@mui/material';
import {Button} from '@mui/material';
// import axios from 'axios';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: '-100vh', opacity: 0 },
  visible: {
    y: '0',
    opacity: 1,
    transition: { delay: 0.2 },
  },
};

/**
 * A modal component to view admin details.
 *
 * @param {{ showModal: boolean, handleCloseModal: function, admin: object }} props
 * @returns {JSX.Element}
 */

const ViewAdminModal = ({ showModal, handleCloseModal, admin }) => { 
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-labelledby='admin-modal-title'
          role="dialog"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-5xl w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-modal-title" className="text-3xl font-bold mb-8 text-center">Admin Details</h2>
            <div className="space-y-4">
              <div>
                <strong>Plant ID: </strong> {admin.PlantID}
              </div>
              <div>
                <strong>User ID: </strong> {admin.user_id}
              </div>
              <div>
                <strong>Email: </strong> {admin.email}
              </div>
              <div>
                <strong>Phone Number: </strong> +{admin.phone_number}
              </div>
              <div className="flex justify-end mt-8">
              <button
           
                onClick={handleCloseModal}
                className="bg-violet-900 text-white p-3 rounded-lg hover:bg-violet-700 hover:text-white transition duration-200"
              >
                Close
              </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewAdminModal;
