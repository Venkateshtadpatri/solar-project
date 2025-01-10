import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MoonLoader } from 'react-spinners'
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import Sidebar from "../UI/Sidebar";
import { motion } from "framer-motion";
import {Bounce, toast} from "react-toastify";

const AdminRegister = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [PlantId, setPlantId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);
  const [Plants, setPlants] = useState([]);
  const [selectedPlantName, setSelectedPlantName] = useState("");

  useEffect(() => {
    setPasswordValid(password.length >= 8);
    setPasswordMatch(password === reenterPassword && password !== "" && reenterPassword !== "");
    setPhoneValid(phone === "" || /^\d{12}$/.test(phone));
  }, [password, reenterPassword, phone]);

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
    const selectedPlant = Plants.find((plant) => plant.Plant_ID === selectedId);
    setSelectedPlantName(selectedPlant ? selectedPlant.Plant_name : "");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/admin-register/",
        {
          PlantId,
          email,
          phone,
          password,
        }
      );
      toast.success("Registration successful!", {
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
  
      setPlantId("");
      setEmail("");
      setPassword("");
      setReenterPassword("");
      setPhone("");
      setSelectedPlantName("");
    } catch (error) {
      const errorMessage =
        error.response?.status === 400
          ? "Invalid registration details"
          : "Registration failed. Please try again.";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        theme: "dark",
      });
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };
  

  if (isAuth) {
    return null;
  }


  return (
      <div className="flex h-screen">
        <Sidebar />
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 p-6 bg-violet-200 flex justify-center items-center overflow-y-auto"
        >
          <Container component="main" maxWidth="md">
            <motion.div
                className="-mt-[150px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 50 }}
            >
              <Card
                  sx={{
                    maxWidth: 600,
                    padding: 4,
                    mt: 18,
                    ml: "200px",
                    mr: "auto",
                    width: "100%",
                  }}
              >
                <CardContent>
                  <Typography
                      variant="h5"
                      component="div"
                      gutterBottom
                      className="flex justify-center"
                      sx={{ fontWeight: "bold" }}
                  >
                    Admin Registration
                  </Typography>
                  <form onSubmit={handleRegister}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <FormControl fullWidth sx={{ width: "80%", mt: 2 }}>
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

                      <TextField
                          label="Selected Plant Name"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          value={selectedPlantName}
                          disabled
                          sx={{ width: "80%" }}
                      />

                      {/* Email Input */}
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

                      {/* Phone Input */}
                      <Box sx={{ width: "80%", marginTop: 2 }}>
                        <PhoneInput
                            country={"in"}
                            value={phone}
                            placeholder="Enter Phone number"
                            onChange={setPhone}
                            inputStyle={{
                              height: "56px",
                              width: "100%",
                              paddingLeft: "68px",
                              borderRadius: "4px",
                              border: "1px solid #c4c4c4",
                              fontSize: "16px",
                            }}
                        />
                        {!phoneValid && phone !== "" && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, textAlign: "left" }}>
                              Phone number must be exactly 12 digits
                            </Typography>
                        )}
                      </Box>

                      {/* Password Input */}
                      <TextField
                          label="Create Password"
                          type="password"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          error={!!password && !passwordValid}
                          helperText={passwordValid ? "" : "Password must be at least 8 characters long"}
                          sx={{ width: "80%" }}
                      />
                      <TextField
                          label="Re-enter Password"
                          type="password"
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          value={reenterPassword}
                          onChange={(e) => setReenterPassword(e.target.value)}
                          required
                          error={!!reenterPassword && !passwordMatch}
                          helperText={
                            passwordMatch
                                ? "✓ Passwords match"
                                : "Passwords do not match"
                          }
                          sx={{ width: "80%" }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: "80%" }}
                          disabled={!passwordValid || !passwordMatch || !phoneValid}
                      >
                        {loading ? <MoonLoader color="#fff" size={24} /> : "Register"}
                      </Button>
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </motion.div>
      </div>
  );
};

export default AdminRegister;
