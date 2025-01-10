/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextField, Link, Typography } from '@mui/material';
import  PhoneInput  from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from 'axios';

const AdminUpdateModal = ({ showModal, handleCloseModal, admin }) => {
  const [email, setEmail] = useState('');
  const [plantID, setPlantID] = useState(''); // State to hold Plant ID, but no edit option
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [phone, setPhone] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [phoneValid, setPhoneValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // useEffect to reset state when a new admin is selected
  useEffect(() => {
    if (admin) {
      setPhone(admin.phone_number || ''); // Default to empty string if undefined
      setEmail(admin.email || ''); // Default to empty string if undefined
      setPlantID(admin.PlantID || ''); // Set Plant ID, default to empty string if undefined
    }
  }, [admin]);

  // Handle form submission to update admin details
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
  
    // Construct payload with only editable fields
    const payload = {
      _id: admin._id,
      user_id: admin.user_id,
      ...(isPhoneEditable && { phone_number: phone }),
      ...(isEmailEditable && { email }),
    };
  

  
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/update-admin/${plantID}/`, payload);
  
      if (response.data.status === 'success') {
        alert('Admin details updated successfully!');
        handleCloseModal();
      } else {
        setError(response.data.message || 'Failed to update admin details');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while updating admin details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleCloseModal}
          aria-labelledby="admin-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <h2 id="admin-modal-title" className="text-3xl font-bold mb-8 text-center">Update Admin Details</h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Admin details update form */}
            <form onSubmit={handleSave}>
              {/* Plant ID Field (Disabled) */}
              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Plant ID"
                  type="text"
                  value={plantID} // Use plantID state
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter Plant ID"
                  sx={{width: '880px'}}
                  disabled // Make the Plant ID field non-editable
                />
              </div>

              {/* Username Field */}
              <div className="mb-6 flex items-center gap-5">
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={setPhone}
                disabled={!isPhoneEditable}
                required={isPhoneEditable}
                inputStyle={{
                  height: "56px", // Adjust to match TextField height
                  width: "100%",
                  paddingLeft: "68px", // Adjust based on design
                  borderRadius: "4px",
                  border: "1px solid #c4c4c4",
                  fontSize: "16px",
                }}
                containerStyle={{
                  width: "100%",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                dropdownStyle={{
                  borderRadius: "4px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              {phone !== "" && !phoneValid && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, textAlign: "left" }}
                >
                  Phone number must be exactly 10 digits
                </Typography>
              )}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPhoneEditable(true);
                  }}
                  className="ml-3 text-blue-500"
                >
                  Edit
                </Link>
              </div>

              {/* Email Field */}
              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter email"
                  disabled={!isEmailEditable}
                  required={isEmailEditable}
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEmailEditable(true);
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
                  disabled={(!isPhoneEditable && !isEmailEditable) || isSubmitting || !phone} // Disable if no edits or required fields are missing
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

export default AdminUpdateModal;
