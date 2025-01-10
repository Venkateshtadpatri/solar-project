import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = {
  isAuthenticated: false,
  role: null,
  token: null,
  user_id: null,
  PlantId: null, // Add PlantId here
};

const authSlice = createSlice({
  name: "authentication",
  initialState: initialAuthState,
  reducers: {
    /**
     * Set the authentication state to true and set the user's role when logging in
     * @param {object} state - The current state of the authentication slice
     * @param {object} action - The action payload containing the user's role
     */
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.user_id = action.payload.user_id;
      state.PlantId = action.payload.PlantId; // Store PlantId here
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.token = null;
      state.user_id = null;
      state.PlantId = null; // Reset PlantId on logout
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;