/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@mui/material';

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

const ViewPlantModal = ({ showModal, handleCloseModal, plant }) => {
  return (
    <AnimatePresence>
      {showModal &&  (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleCloseModal}
          aria-labelledby="plant-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-5xl w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <h2 id="plant-modal-title" className="text-3xl font-bold mb-8 text-center">Plant Details</h2>
            {/* Display plant details here */}
            <div className="space-y-4">
            <div>
                <strong>Plant ID: </strong>{plant.Plant_ID}
              </div>
              <div>
                <strong>Plant Name: </strong>{plant.Plant_name}
              </div>
              <div>
                <strong>Address: </strong>{plant.Address}, {plant.City}, {plant.State}, {plant['ZIP/Postal']}
              </div>
              <div>
                <strong>Primary Contact: </strong>{plant.Primary_contact_name} - {plant.Primary_contact_email}, {plant.Primary_contact_phonenumber}
              </div>
              <div>
                <strong>Secondary Contact: </strong>{plant.Secondary_contact_name} - {plant.Secondary_contact_email}, {plant.Secondary_contact_phonenumber}
              </div>
              <div>
                <strong>Number of Panels: </strong>{plant.Number_of_panels}
              </div>
              <div>
                <strong>Land Area: </strong>{plant.Land_area} acres
              </div>
              <div>
                <strong>Operating Hours: </strong>{plant.Operating_hours}
              </div>
              <div>
                <strong>Status: </strong>{plant.Status}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleCloseModal}
                className="bg-violet-900 text-white px-4 py-3 rounded-lg hover:bg-violet-700 hover:text-white transition duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewPlantModal;
