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

const ViewSMBModal = ({ showModal, handleCloseModal, smb }) => { 
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-labelledby='admin-modal-title'
          role="dialog"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white mt-[250px] p-8 md:p-12 rounded-lg shadow-lg max-w-5xl w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="smb-modal-title" className="text-3xl font-bold mb-8 text-center">View SMB Details</h2>
            <div className="space-y-4">
              <div>
                <strong>SMB Type: </strong> {smb.SMB_type}
              </div>
              <div>
                <strong>Communication Protocol: </strong> {smb.Communication_protocol}
              </div>
              <div>
                <strong>SMB ID: </strong> {smb.SMB_ID}
              </div>
              <div>
                <strong>Plant ID: </strong> {smb.Plant_ID}    
              </div>
              <div>
                <strong>Installation Location: </strong> {smb.Installation_location}
              </div>
              <div>
                <strong>Installation Date: </strong> {smb.Installation_date}
              </div>
              <div>
                <strong>String Count: </strong> {smb.String_count}
              </div>
              <div>
                <strong>Voltage Rating: </strong> {smb.Voltage_rating}
              </div>
              <div>
                <strong>Current Rating: </strong> {smb.Current_rating}
              </div>
              <div>
                <strong>Power Rating: </strong> {smb.Power_rating}
              </div>
              <div>
                <strong>Operational State: </strong> {smb.Operational_state}
              </div>
              <div>
                <strong>Voltage Alert Threshold: </strong> {smb.Voltage_alert_threshold}
              </div>
              <div>
                <strong>Current Alert Threshold: </strong> {smb.Current_alert_threshold}
              </div>

              {/* Conditionally render additional fields if SMB_type is "SMB_wired" */}
              {smb.SMB_type === "SMB_wired" && (
                <>
                  <div>
                    <strong>IP Address: </strong> {smb.IP_Address}
                  </div>
                  <div>
                    <strong>Port Number: </strong> {smb.Port_number}
                  </div>
                  <div>
                    <strong>Modbus Address: </strong> {smb.Modbus_Address}
                  </div>
                </>
              )}

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

export default ViewSMBModal;
