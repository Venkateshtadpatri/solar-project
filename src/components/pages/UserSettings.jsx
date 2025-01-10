import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Side from '../../components/Home/Bar/Side';
import axios from 'axios';
import { Box, TextField, Typography } from "@mui/material";
import PhoneInput from "react-phone-input-2";

/**
 * UserSettings component
 *
 * This component renders the User Settings page only if the user is authenticated.
 * Otherwise, it redirects to the home page.
 *
 * It renders a sidebar and a main content area. The main content area shows a heading
 * with the text "User Settings Page". The main content area is animated using framer-motion.
 *
 * @returns {JSX.Element} The User Settings page component.
 */
const UserSettings = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const userId = useSelector((state) => state.auth.user_id);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [phoneValid, setPhoneValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (!isAuth) {
      navigate('/'); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);

  // Phone validation for 12 digits
  useEffect(() => {
    setPhoneValid(phone === "" || /^\d{12}$/.test(phone));
  }, [phone]);

  // Fetch user details including email
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get-user_details-by-id/${userId}`, {
          PlantId
        });

        if (response.data.status === 'success') {
          setCurrentEmail(response.data.email);
          setEmail(response.data.email); // Set the email to state
        } else {
          console.log(response.data.message || 'Failed to get user details');
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserDetails(); // Call the async function inside useEffect

  }, [userId, PlantId]); // Add userId as a dependency if it changes

  // Handle form submission for saving updated details
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      user_id: userId,
      current_email: currentEmail,
      email: email,
      phone: phone,
    };

    try {
      const response = await axios.put('http://127.0.0.1:8000/api/update_user_details/', payload);

      if (response.data.status === 'success') {
        alert('User details updated successfully!');
        setPhone("");
        setEmail("");
      } else {
        console.log(response.data.message || 'Failed to update user details');
      }
    } catch (error) {
      console.error(error.response?.data?.message || 'An error occurred while updating user details.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
      <>
        {isAuth && (
            <div className="flex h-screen">
              {/* Navbar as Sidebar */}
              <Side />
              {/* Main Content */}
              <motion.div
                  className="flex-1 p-6 bg-blue-100 flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
              >
                <div className="grid gap-[20px] ml-[250px] w-full">
                  {/* First Section with Two Columns */}
                  <div className="grid grid-cols-1 gap-[50px]">
                    <div className="h-[300px] w-[500px] ml-[350px] flex flex-col justify-center items-center bg-white rounded-lg shadow-lg p-6">
                      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
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
                      <button
                          onClick={handleSave}
                          className="px-4 py-2 mt-4 w-[200px] bg-[#003366] text-white rounded-lg hover:bg-[#0051A2]"
                          disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving profile...' : 'Update Profile'}
                      </button>
                    </div>
                  </div>

                  {/* Second Section Taking Full Width */}
                  <div className="h-[370px] bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Notification Settings:</h1>
                    <div className="flex flex-col px-3 py-4 gap-[40px]">
                      <div className="flex text-center gap-[20px]">
                        <input type="checkbox" id="settings-1" className="w-7 h-7" />
                        <label htmlFor="settings-1" className="text-xl font-semibold">Receive email alerts for Critical Faults</label>
                      </div>
                      <div className="flex text-center gap-[20px]">
                        <input type="checkbox" id="settings-2" className="w-7 h-7" />
                        <label htmlFor="settings-2" className="text-xl font-semibold">Receive Performance update notifications</label>
                      </div>
                      <div className="flex text-center gap-[20px]">
                        <input type="checkbox" id="settings-3" className="w-7 h-7" />
                        <label htmlFor="settings-3" className="text-xl font-semibold">Get reminders for scheduled maintenance</label>
                      </div>
                    </div>
                    <button className="px-4 py-5 mt-4 w-[300px] bg-[#003366] text-white rounded-lg hover:bg-[#0051A2]">
                      Save Notification Preferences
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </>
  );
};

export default UserSettings;
