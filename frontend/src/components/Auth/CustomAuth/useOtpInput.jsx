// useOtpInput.js
import { useState, useRef, forwardRef } from "react";
import OtpInput from 'react-otp-input'; // Import react-otp-input

const useOtpInput = (onOtpSubmit) => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);

  const handleChange = (newOtp) => {
    setOtp(newOtp);
  };

  const handleSubmit = () => {
    if (otp.length === 6) {
      onOtpSubmit(otp);
    } else {
      alert('Please enter a valid 6-digit OTP.');
    }
  };

  // Forward ref to the input element
  const CustomInput = forwardRef((props, ref) => (
    <input
      {...props}
      ref={ref}
      style={{
        width: '3rem',
        height: '3rem',
        margin: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '2rem',
        textAlign: 'center',
      }}
    />
  ));

  return {
    inputRef,
    OtpInputComponent: (
      <OtpInput
        value={otp}
        onChange={handleChange}
        numInputs={6}
        separator={<span>-</span>}
        renderInput={(props) => <CustomInput {...props} />}
        onSubmit={handleSubmit}
      />
    ),
  };
};

export default useOtpInput;
