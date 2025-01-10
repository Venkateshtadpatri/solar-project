import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion } from "framer-motion";

import { Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import OtpInput from "./OtpInput"; // Ensure the path is correct
import {Bounce, toast} from 'react-toastify'; // Import toast
const ContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { ease: "easeInOut" } }
};

const EnterOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendAvailable, setResendAvailable] = useState(false);
  const navigate = useNavigate();
  const email = useSelector(state => state.email.email);
  const userId = useSelector(state => state.userId.userId);
  const inputRef = useRef(null);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      toast.warning("OTP must be 6 digits",{
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
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/verify_otp/', { user_id: userId, email, otp });

      if (response.status === 200) {
        toast.success('OTP Verified Successfully!');
        navigate("/reset-password");
      } else {
        toast.error('Invalid OTP. Please try again.',{
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/resend_otp/', { user_id: userId, email });

      if (response.status === 200) {
        toast.success('OTP has been resent to your email.');
        setTimer(30);  // Reset timer
        setResendAvailable(false);
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('An error occurred while resending the OTP. Please try again.',{
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (timer > 0 && !resendAvailable) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalId);
            setResendAvailable(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer, resendAvailable]);

  return (
      <div className='flex justify-center items-center h-screen bg-blue-900'>
        <motion.div
            variants={ContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className='bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full'
        >
          <h2 className='text-xl font-bold mb-8'>Enter OTP Code</h2>
          <OtpInput
              ref={inputRef}
              length={6}
              onOtpSubmit={handleOtpChange}
          />
          <div className='flex justify-center mt-6'>
            <Button
                type="button"
                className='bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600'
                onClick={handleOtpSubmit}
                variant='contained'
                size='large'
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit OTP'}
            </Button>
          </div>
          <div className='flex justify-center mt-6'>
            <Button
                className='bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600'
                onClick={handleResendOtp}
                variant='contained'
                size='large'
                disabled={!resendAvailable}
            >
              Resend OTP
            </Button>
          </div>
          <div className='flex justify-center mt-4'>
            {!resendAvailable && <span className='text-gray-700'>Resend OTP in {timer}s</span>}
          </div>
        </motion.div>
      </div>
  );
};

export default EnterOtpPage;
