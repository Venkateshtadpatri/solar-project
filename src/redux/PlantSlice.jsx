// src/store/plantSlice.js
import { createSlice } from '@reduxjs/toolkit';

const plantSlice = createSlice({
  name: 'plants',
  initialState: {
    plantCount: 0,
    adminCount: 0,
  },
  reducers: {
    setPlantCount: (state, action) => {
      state.plantCount = action.payload;
    },
    setAdminCount: (state, action) => {
      state.adminCount = action.payload;
    },
  },
});

export const { setPlantCount, setAdminCount } = plantSlice.actions;

export default plantSlice.reducer;
