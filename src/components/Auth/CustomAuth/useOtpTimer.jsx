// useOtpTimer.js
import { useState, useEffect, useRef } from "react";

const useOtpTimer = () => {
  const [timer, setTimer] = useState(60);
  const [resendAvailable, setResendAvailable] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
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

  return { timer, resendAvailable, setTimer, setResendAvailable, inputRef };
};

export default useOtpTimer;
