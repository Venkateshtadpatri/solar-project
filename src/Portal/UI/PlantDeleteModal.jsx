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

const PlantDeleteModal = ({ showModal, handleCloseModal, plant }) => {
  const handleDeletePlant = async (e) => {
    e.preventDefault();
    // Add your delete logic here
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete-solar-plant/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plant_id: plant.Plant_ID  || ''}), // Assuming plant has an id property
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          handleCloseModal();
        } else {
          alert(result.message || 'Failed to delete the plant. Please try again.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete the plant. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {showModal &&  (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleCloseModal} // Closes modal when clicking outside
        >
          <motion.div
            className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Delete Plant</h2>
            <form onSubmit={handleDeletePlant}>
              <p className="mb-6 text-center">
                Are you sure you want to delete this Solar Plant with ID: <strong>{plant.Plant_ID}</strong>?
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  type="submit" 
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-200"
                >
                  Yes, Delete
                </button>
                <button 
                  type="button" // Changed to type="button" to prevent form submission
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

export default PlantDeleteModal;
