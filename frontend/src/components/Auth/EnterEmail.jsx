import { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { setEmail as setEmailRedux, clearEmail } from "../../redux/EmailSlice"; // Import clearEmail
import { setUserId as setUserIdRedux } from "../../redux/userIdSlice";
import { Button, Box, TextField } from "@mui/material";
import { ClipLoader } from 'react-spinners'; // Import the spinner
import { Bounce, toast } from 'react-toastify'; // Import react-toastify

const ContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    transition: { ease: "easeInOut" },
  }
};

/**
 * EnterEmailPage is a React component that allows users to input their email and user ID
 * to request a verification code. It manages local state for email, user ID, and loading
 * status, and dispatches these to a Redux store. Upon form submission, it sends a POST
 * request to a server API to send a verification code. Success or error notifications are
 * displayed using toast messages, and navigation is handled to redirect users to an OTP
 * entry page upon success.
 */

const EnterEmailPage = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent submission if loading
    if (loading) return;

    setLoading(true); // Show the spinner

    // Dispatch email and userId to Redux
    dispatch(setUserIdRedux(userId));
    dispatch(setEmailRedux(email));

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/send_otp/', {
        email: email, // Directly pass email as the request body
        user_id: userId
      });

      if (response.status === 200) {
        toast.success('Verification code sent successfully!',{
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }); // Success toast
        navigate('/enter-otp');
      } else {
        toast.error('Failed to send verification code. Please try again.',{
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }); // Error toast
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.',{
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      }); // Error toast
    } finally {
      setLoading(false); // Hide the spinner
      dispatch(clearEmail()); // Clear email after submission or error
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-900">
      <AnimatePresence>
        <motion.div
          variants={ContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
        >
          <h2 className="text-xl font-bold mb-8">Enter Your User Id and Email</h2>
          <div className="flex justify-center flex-col items-center">
            <form onSubmit={handleSubmit}>
              <Box sx={{ width: "500px", marginLeft: 10, marginTop: -1 }}>
                <TextField
                  label="userId"
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  sx={{ width: "80%" }}
                />
              </Box>
              <Box sx={{ width: "500px", marginLeft: 10, marginTop: -1 }}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ width: "80%" }}
                />
              </Box>
              <div className="flex justify-center mt-5">
                <Button
                  className="bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600"
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading} // Disable the button while loading
                  sx={{
                    backgroundColor: loading ? 'darkblue' : 'primary.main',
                    '&:disabled': {
                      backgroundColor: 'darkblue',
                      color: '#ffffff'
                    }
                  }}
                >
                  {loading ? <ClipLoader color="#fff" size={24} /> : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnterEmailPage;
