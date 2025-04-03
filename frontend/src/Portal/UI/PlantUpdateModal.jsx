/* eslint-disable react/prop-types */
import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button, TextField, Link } from '@mui/material';

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
 * A modal component to update plant details.
 *
 * @param {boolean} showModal - Indicates whether the modal should be displayed.
 * @param {function} handleCloseModal - Function to close the modal.
 * @param {object} plant - The plant object containing details to be updated.
 *
 * @returns {JSX.Element} The rendered component.
 *
 * This component allows users to edit and update specific details of a plant,
 * such as the plant name, primary contact name, and primary contact email.
 * Changes are only submitted if the corresponding fields are marked as editable.
 * The component handles form submission and displays success or error messages
 * based on the outcome of the update operation.
 */

const PlantUpdateModal = ({ showModal, handleCloseModal, plant }) => {
  const [plantName, setPlantName] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  // const [PostalCode, setPostalCode] = useState(plant?.ZIP_Postal || '');
  // const [Geolocation, setGeolocation] = useState(plant?.Geolocation || '');
  // const [TotalPanelCount, setTotalPanelCount] = useState(plant?.Number_of_panels || '');
  // const [PlantCapacity, setPlantCapacity] = useState(plant?.plant_capacity ||'');
  // const [LandArea, setLandArea] = useState(plant?.Land_area || '');
  // const [OperatingHours, setOperatingHours] = useState(plant?.operating_hours || '');
  // const [Status, setStatus] = useState(plant?.Status || '');
  const [isPlantNameEditable, setIsPlantNameEditable] = useState(false);
  const [isPrimaryContactEditable, setIsPrimaryContactEditable] = useState(false);
  const [isPrimaryEmailEditable, setIsPrimaryEmailEditable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (plant) {
      setPlantName(plant.Plant_name || ''); // Default to empty string if undefined
      setPrimaryContact(plant.Primary_contact_name || ''); // Default to empty string if undefined
      setPrimaryEmail(plant.Primary_contact_email || ''); // Set Plant ID, default to empty string if undefined
    }
  }, [plant]);
  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Mark as submitting

    // Construct the payload with editable fields only
    const payload = {
      _id: plant._id, // Use MongoDB ObjectId (_id) instead of id
      ...(isPlantNameEditable && { Plant_name: plantName }),
      ...(isPrimaryContactEditable && { primary_contact_name: primaryContact }),
      ...(isPrimaryEmailEditable && { primary_contact_email: primaryEmail }),
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/update-plant/', payload);

      if (response.data.status === 'success') {
        alert('Plant details updated successfully!');
        handleCloseModal();
        
      } else {
        setError(response.data.message || 'Failed to update plant details');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while updating plant details.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
      setIsPlantNameEditable(false);
      setIsPrimaryContactEditable(false);
      setIsPrimaryEmailEditable(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && plant && (
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
            <h2 id="plant-modal-title" className="text-3xl font-bold mb-8 text-center">Update Plant Details</h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Plant update form */}
            <form onSubmit={handleSave}>
              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Plant Name"
                  type="text"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter plant name"
                  disabled={!isPlantNameEditable}
                  required={isPlantNameEditable}
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPlantNameEditable(true);
                  }}
                  className="ml-3 text-blue-500"
                >
                  Edit
                </Link>
              </div>

              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Primary Contact Name"
                  type="text"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter contact name"
                  disabled={!isPrimaryContactEditable}
                  required={isPrimaryContactEditable}
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPrimaryContactEditable(true);
                  }}
                  className="ml-3 text-blue-500"
                >
                  Edit
                </Link>
              </div>

              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Primary Contact Email"
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter email"
                  disabled={!isPrimaryEmailEditable}
                  required={isPrimaryEmailEditable}
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPrimaryEmailEditable(true);
                  }}
                  className="ml-3 text-blue-500"
                >
                  Edit
                </Link>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    (!isPlantNameEditable && !isPrimaryContactEditable && !isPrimaryEmailEditable) || isSubmitting
                  } // Disable if no edits or submitting
                  className="bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-700 hover:text-white transition duration-200"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCloseModal}
                  className="bg-gray-300 text-black p-3 rounded-lg hover:bg-gray-400 hover:text-black transition duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlantUpdateModal;
