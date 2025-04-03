// src/store/plantSlice.js
import { createSlice } from '@reduxjs/toolkit';

const plantSlice = createSlice({
  name: 'plants',
  initialState: {
    plantCount: 0,
    adminCount: 0,
  },
  reducers: {

    /**
     * Sets the total number of plants in the state.
     * @function
     * @param {Object} state - The current state of the plants slice.
     * @param {Object} action - The action payload containing the new plant count.
     */
    setPlantCount: (state, action) => {
      state.plantCount = action.payload;
    },
    /**
     * Sets the total number of admins in the state.
     * @function
     * @param {Object} state - The current state of the plants slice.
     * @param {Object} action - The action payload containing the new admin count.
     */
    setAdminCount: (state, action) => {
      state.adminCount = action.payload;
    },
  },
});

export const { setPlantCount, setAdminCount } = plantSlice.actions;

export default plantSlice.reducer;
