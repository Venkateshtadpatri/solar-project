// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import plantReducer from './PlantSlice'
import userIdReducer from "./userIdSlice";
// import phoneReducer from './PhoneSlice';
import emailReducer from './EmailSlice';
import userReducer from './userSlice'; // Import the user slice

// Setting up the store with the slices
const store = configureStore({
  reducer: { auth: authReducer, email: emailReducer, user: userReducer,plants: plantReducer, userId: userIdReducer }, // Add user reducer
});

// Exporting the actions and the store
export default store;
