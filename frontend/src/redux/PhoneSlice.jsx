import { createSlice } from '@reduxjs/toolkit';

const phoneSlice = createSlice({
  name: 'phone',
  initialState: {
    phone: '',
  },
  reducers: {
    /**
     * Sets the email in the state to the action payload
     * @function
     * @param {Object} state - The current state of the emailSlice
     * @param {Object} action - The action object with the email address as its payload
     */
    setPhone: (state, action) => {
      state.phone = action.payload;
    },
    /**
     * Clears the email from the state
     * @function
     * @param {Object} state - The current state of the emailSlice
     */
    clearPhone: (state) => {
      state.phone = '';
    },
  },
});

export const { setPhone, clearPhone } = phoneSlice.actions;
export default phoneSlice.reducer;