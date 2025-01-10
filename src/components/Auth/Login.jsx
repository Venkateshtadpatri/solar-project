/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { Bounce, toast } from "react-toastify";
import { MoonLoader } from 'react-spinners'
import { TextField, MenuItem, Select, InputLabel, FormControl, Button, OutlinedInput, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import MUI icons for visibility
import { authActions } from "../../redux/auth";

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: { delay: 0.2 },
  },
};

/**
 * Handles user authentication.
 *
 * @param {function} onClose - Function to call when the modal is closed.
 *
 * @returns {JSX.Element} - The login modal component.
 */
const Auth = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get authentication status from Redux
  const isAuth = useSelector((state) => state.auth.isAuthenticated);

  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    role: ''
  });
  const [PlantId, setPlantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [Plants, setPlants] = useState([]);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to /dashboard if authenticated
  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    let isMounted = true; // Track component's mounted state
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/solar-plants/");
        if (isMounted) {
          setPlants(response.data.plants);
        }
      } catch (error) {
        console.error("Error fetching plant data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);
  const handlePlantChange = (event) => {
    const selectedId = event.target.value;
    setPlantId(selectedId);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const loginHandler = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true); // Show the spinner
    const { user_id, password, role } = formData;

    if (role === "" || role === "select a role") {
      alert("Please select a valid role.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        Plant_ID: PlantId,
        user_id,
        password,
        role,
      });

      if (response.status === 200) {
        dispatch(authActions.login({
          role,
          token: response.data.token,
          user_id,
          PlantId, // Dispatch PlantId to Redux
        }));
        handleClose();
        navigate("/dashboard");
        toast.success("Login successful!", {
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

      } else {
        console.error("Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.", {
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
    } catch (error) {
      console.error("Login failed: Please check your credentials.", error);
      toast.error(`Login failed: Please check your credentials. `, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      })
    }
    finally {
      setLoading(false)
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={() => handleClose()}
      >
        <motion.div
          className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-black">Login</h2>
          <form onSubmit={loginHandler}>
            <div className="mb-6">
              <FormControl fullWidth sx={{ width: "100%", mt: 2 }}>
              <InputLabel id="plant-id-label">Plant-ID *</InputLabel>
              <Select
                  labelId="plant-id-label"
                  name="Plant_ID"
                  value={PlantId}
                  label="Plant-ID *"
                  onChange={handlePlantChange}
                  required
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 200 },
                    },
                  }}
              >
                <MenuItem value="" disabled>
                  Select PlantID
                </MenuItem>
                {Plants.map((plant) => (
                    <MenuItem key={plant.Plant_ID} value={plant.Plant_ID}>
                      {plant.Plant_ID}
                    </MenuItem>
                ))}
              </Select>
              </FormControl>
            </div>
            <div className="mb-6">
              <TextField
                label="user_id"
                id="user_id"
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="medium"
                placeholder="Enter your username"
                required
                autoComplete="off"
                className="rounded-lg"
              />
            </div>
            <div className="mb-6">
              {/* Use OutlinedInput instead of TextField for password field to add custom adornment */}
              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle input type
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password" // Necessary for displaying the label correctly
                />
              </FormControl>
            </div>
            <div className="mb-8">
              <FormControl fullWidth size="medium">
                <InputLabel id="role-label" htmlFor="role">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  variant="outlined"
                  label="Role"
                  className="rounded-lg"
                  autoComplete="off"
                >
                  <MenuItem value="" disabled>
                    Select a Role
                  </MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-center">
              <Button
                className="w-[50%] bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600"
                type="submit"
                variant="contained"
                size="large"
              >
                {loading ? <MoonLoader color="#fff" size={24} /> : "Login"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Button
              className="text-blue-600 underline"
              onClick={() => {
                handleClose(); // Close the modal
                navigate('/Enter-email'); // Navigate to the Forgot Password page
              }}
            >
              Forgot Password?
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Auth;
