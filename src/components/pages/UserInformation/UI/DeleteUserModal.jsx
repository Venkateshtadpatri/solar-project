/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@mui/material';

import {Bounce, toast} from "react-toastify";

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

const DeleteUserModal = ({ showModal, handleCloseModal, user }) => {
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete_user/${user.Plant_Id}/${user.user_id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email || ''}), // Ensure user.email is defined
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          toast.success('User deleted successfully.',{
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          handleCloseModal();
        } else {
          toast.error(result.message || 'Failed to delete user. Please try again.', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete user. Please try again.',{
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An unexpected error occurred. Please try again.',{
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
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
            className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Delete User</h2>
            <p className="mb-6 text-center">
              Are you sure you want to delete the user &quot;{user?.email || 'unknown user'}&quot;?
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeleteUser}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseModal}
              >
                No, Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteUserModal;
