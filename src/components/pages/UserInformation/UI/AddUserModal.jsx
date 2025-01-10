import  { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import { Bounce, toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import  PhoneInput  from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { MoonLoader } from 'react-spinners/MoonLoader';

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

// eslint-disable-next-line react/prop-types
const AddUserModal = ({ showModal, handleCloseModal, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);

  const PlantId = useSelector((state) => state.auth.PlantId);
  useEffect(() => {
    setPasswordValid(password.length >= 8);
    setPasswordMatch(password === reenterPassword && password !== "" && reenterPassword !== "");
    setPhoneValid(phone === "" || /^\d{12}$/.test(phone));
  }, [password, reenterPassword, phone]);
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/add_user/', {
        Plant_ID: PlantId,
        email,
        phone,
        password,
      });
  
      if (response.status === 201) {
        // Extract user data from response
        const newUser = response.data.user; // Access the user directly
        
        // Ensure all required fields are present and not empty
        if (newUser.email) {
          // Alert for success
          toast.success('User Added Successfully!',{
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
  
          // Add the user to the table immediately
          onUserAdded({
            id: newUser.id, // Ensure this is the correct path to the ID
            PlantId: newUser.PlantId,
            email: newUser.email,
          });
  
          // Close the modal immediately
          handleCloseModal();
        } else {
          console.error('Incomplete user data:', newUser);
          toast.error(`Failed to add user`, {
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
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user. Please try again.',{
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
    finally {
      setLoading(false);
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
            <h2 className="text-3xl font-bold mb-8 text-center">Add User</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-6">
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter email"
                  required
                  className="rounded-lg"
                />
              </div>
              <Box sx={{ width: "415px", marginBottom: 3, marginTop: 2 }}>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={setPhone}
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
            </Box>
              <div className="mb-6">
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter password"
                  required
                  error={!!password && !passwordValid}
                      helperText={
                        passwordValid ? "" : "Password must be at least 8 characters long"
                      }
                  className="rounded-lg"
                />
              </div>
              <div className="mb-6">
                <TextField
                  label="Re-enter Password"
                  type="password"
                  value={reenterPassword}
                  onChange={(e) => setReenterPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Enter password"
                  required
                  error={!!reenterPassword && !passwordMatch}
                      helperText={
                        !!password && !!reenterPassword ? (
                          passwordMatch ? (
                            <Typography component="span" sx={{ color: "green" }}>
                              ✓ Passwords match
                            </Typography>
                          ) : (
                            "Passwords do not match"
                          )
                        ) : (
                          ""
                        )
                      }
                  className="rounded-lg"
                />
              </div>
              <div className="flex justify-between mt-8">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {loading ? <MoonLoader color="#fff" size={20} /> : "Submit"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleCloseModal}
                  className="bg-blue-900 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
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

export default AddUserModal;
