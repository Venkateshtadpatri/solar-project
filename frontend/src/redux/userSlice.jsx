// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: '',
    email: '',
  },
  reducers: {
    /**
     * Set the user's username and email in the state
     * @param {object} state - The current state of the user slice
     * @param {object} action - The action payload containing the user's username and email
     */
    setUser(state, action) {
      const { username, email } = action.payload;
      state.username = username;
      state.email = email;
    },
    /**
     * Clear the user's username and email from the state
     * @param {object} state - The current state of the user slice
     */
    clearUser(state) {
      state.username = '';
      state.email = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
