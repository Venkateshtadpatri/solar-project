/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from 'framer-motion';

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
 * A modal component to delete an admin.
 *
 * @param {{ showModal: boolean, handleCloseModal: function, admin: object }} props
 * @returns {JSX.Element}
 *
 * This component renders a modal when the `showModal` prop is true, and
 * displays a confirmation message to the user. If the user confirms the
 * deletion, it sends a DELETE request to the server with the admin's PlantID
 * and username as the request body. If the response is successful, it closes
 * the modal. If the response is not successful, it will display an error message
 * to the user.
 */
const AdminDeleteModal = ({ showModal, handleCloseModal, admin }) => {
  const handleDeleteAdmin = async (e) => {
    try {
  /**
   * Handles the delete event for an admin.
   *
   * This function sends a DELETE request to the server with the admin's PlantID
   * and username as the request body. If the response is successful, it closes
   * the modal. If the response is not successful, it will display an error message
   * to the user.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   *
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
      const response = await fetch(`http://127.0.0.1:8000/api/delete-admin/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plant_id: admin?.PlantID, username: admin?.username }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          handleCloseModal();
        } else {
          alert(result.message || 'Failed to delete the admin. Please try again.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete the admin. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('An unexpected error occurred. Please try again.');
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
          onClick={handleCloseModal}  // Closes modal when clicking outside
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}  // Prevents closing when clicking inside the modal
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Delete User</h2>
            <form onSubmit={handleDeleteAdmin}>
              <p className="mb-6 text-center">
                Are you sure you want to delete Admin {admin.username} with PlantID: <strong>{admin.PlantID}</strong>?
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  type="submit" 
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Yes, Delete
                </button>
                <button 
                  type="button"  // Ensure this button does not submit the form
                  onClick={handleCloseModal} 
                  className="border-2 border-red-500 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition duration-200"
                >
                  No, Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminDeleteModal;
