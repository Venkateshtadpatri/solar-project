/* eslint-disable react/prop-types */

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button, Link } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../../redux/userSlice'; // Import the action

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

const UpdateUserModal = ({ showModal, handleCloseModal, user }) => {
  const dispatch = useDispatch();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUsernameEditable, setIsUsernameEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  // Update state whenever the user prop changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Mark as submitting

    const payload = {
      _id: user._id, // Use MongoDB ObjectId (_id) instead of id
      ...(isUsernameEditable && { username }),
      ...(isEmailEditable && { email }),
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/update_user_details/', payload);

      if (response.data.status === 'success') {
        // Update user in global state (Redux)
        dispatch(setUser({ username, email }));

        alert('User details updated successfully!');
        handleCloseModal();
      } else {
        setError(response.data.message || 'Failed to update user details');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while updating user details.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Update User</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSave}>
              <div className="mb-6 flex items-center gap-5">
                <TextField
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter username"
                  disabled={!isUsernameEditable}
                  required={isUsernameEditable}
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsUsernameEditable(true);
                  }}
                  className="ml-3 text-blue-500"
                >
                  Edit
                </Link>
              </div>

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

              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isUsernameEditable && !isEmailEditable || isSubmitting} // Disable if no edits or submitting
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCloseModal}
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

export default UpdateUserModal;
