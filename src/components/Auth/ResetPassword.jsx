import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { TextField, Button, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { Bounce, toast } from "react-toastify"; // Import toast

const ContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    x: "-100vw",
    transition: { ease: "easeInOut" },
  },
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const email = useSelector((state) => state.email.email);
  const userId = useSelector((state) => state.userId.userId);

  useEffect(() => {
    setPasswordValid(password.length >= 8);
    setPasswordMatch(
      password === confirmPassword && password !== "" && confirmPassword !== ""
    );
  }, [password, confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!passwordValid || !passwordMatch) return;

    setLoading(true); // Start loading spinner

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/reset_password/",
        {
          user_id: userId, // Include user ID in the API call
          email, // Include email in the API call
          new_password: password, // Send the new password
        }
      );

      setLoading(false); // Stop loading spinner

      if (response.status === 200) {
        toast.success("Password reset successfully!", {
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
        navigate("/");
      } else if (response.status === 404) {
        toast.error("User not found. Please check the email and try again.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } catch (error) {
      setLoading(false); // Stop loading spinner in case of an error
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.", {
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

  return (
    <div className="flex justify-center items-center h-screen bg-blue-900">
      <motion.div
        variants={ContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              fullWidth
              variant="outlined"
              margin="normal"
              disabled
              sx={{ width: "80%" }}
            />
            <TextField
              label="New Password"
              type="password"
              name="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              required
              error={!!password && !passwordValid}
              helperText={
                passwordValid
                  ? ""
                  : "Password must be at least 8 characters long"
              }
              sx={{ width: "80%" }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              name="retype-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              required
              error={!!confirmPassword && !passwordMatch}
              helperText={
                !!password && !!confirmPassword ? (
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
              sx={{ width: "80%" }}
            />
          </Box>
          <div className="flex justify-center mt-4">
            <Button
              className="bg-blue-700 text-white py-4 px-6 rounded-lg hover:bg-blue-600"
              type="submit"
              variant="contained"
              size="large"
              disabled={!passwordValid || !passwordMatch || loading}
            >
              {loading ? (
                <ClipLoader size={24} color={"#ffffff"} />
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
