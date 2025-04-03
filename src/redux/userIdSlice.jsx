import { createSlice } from '@reduxjs/toolkit';

const userIdSlice = createSlice({
  name: 'userId',
  initialState: {
    userId: '',
  },
  reducers: {
    /**
     * Set the user ID in the state
     * @param {string} action.payload the user ID to set
     */
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    /**
     * Clear the user ID in the state
     */
    clearUserId: (state) => {
      state.userId = '';
    },
  },
});

export const { setUserId, clearUserId } = userIdSlice.actions;
export default userIdSlice.reducer;
