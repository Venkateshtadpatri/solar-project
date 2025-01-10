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

const SMBDeleteModal = ({ showModal, handleCloseModal, smb }) => {
  const handleDeleteAdmin = async (e) => {
    e.preventDefault();
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
                Are you sure you want to delete smb with ID {smb.SMB_ID} with PlantID: <strong>{smb.Plant_ID}</strong>?
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

export default SMBDeleteModal;
