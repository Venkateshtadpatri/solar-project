import { createSlice } from '@reduxjs/toolkit';

const emailSlice = createSlice({
  name: 'email',
  initialState: {
    email: '',
  },
  reducers: {
    /**
     * Sets the email in the state to the action payload
     * @function
     * @param {Object} state - The current state of the emailSlice
     * @param {Object} action - The action object with the email address as its payload
     */
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    /**
     * Clears the email from the state
     * @function
     * @param {Object} state - The current state of the emailSlice
     */
    clearEmail: (state) => {
      state.email = '';
    },
  },
});

export const { setEmail, clearEmail } = emailSlice.actions;
export default emailSlice.reducer;