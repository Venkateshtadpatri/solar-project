import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reportNumber: 1, // Start from 1
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    /**
     * Increments the report number by 1.
     */
    incrementReportNumber: (state) => {
      state.reportNumber += 1; // Increment report number
    },
    /**
     * Resets the report number to 1 if needed.
     */
    resetReportNumber: (state) => {
      state.reportNumber = 1; // Reset if needed
    },
  },
});

export const { incrementReportNumber, resetReportNumber } = reportSlice.actions;
export default reportSlice.reducer;
