/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import  { useState, useRef, useEffect, forwardRef } from "react";

/**
 * A component to render an OTP input with the given length.
 *
 * @param {{length: number, onOtpSubmit: (otp: string) => void}} props
 * @param {number} props.length The length of the OTP.
 * @param {(otp: string) => void} props.onOtpSubmit The function to call when the OTP is submitted.
 * @param {React.Ref} ref Forwarded ref to focus the first input
 * @returns {JSX.Element}
 */
const OtpInput = forwardRef(({ length = 6, onOtpSubmit = () => {} }, ref) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (ref && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [ref]);

  /**
   * Handles a change in one of the OTP input fields.
   * @param {number} index The index of the input field that changed.
   * @param {React.ChangeEvent<HTMLInputElement>} e The change event.
   * @returns {void}
   */
  const handleChange = (index, e) => {
    const value = e.target.value;

    // Only allow numbers and a maximum of one character
    if (!/^[0-9]$/.test(value) && value !== "") return; // Regular expression to match a single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Join and check the combined OTP
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onOtpSubmit(combinedOtp); // Call the submit function with the combined OTP
    }

    // Focus the next input if current value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

/**
 * Handles keydown events for OTP input fields, specifically managing
 * the focus behavior when the "Backspace" key is pressed. If the current
 * input is empty and it is not the first input, the focus is moved to
 * the previous input field.
 *
 * @param {number} index - The index of the current input field.
 * @param {KeyboardEvent} e - The keyboard event triggered by the keydown action.
 */
  const handleKeyDown = (index, e) => {
    // Backspace handling
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus(); // Move focus to the previous input if current is empty
      }
    }
  };

  return (
    <div className="flex justify-center mb-6">
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          ref={(el) => (inputRefs.current[index] = el)}
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-12 mx-1 text-center text-xl border rounded-lg"
          maxLength="1"
        />
      ))}
    </div>
  );
});

export default OtpInput;
