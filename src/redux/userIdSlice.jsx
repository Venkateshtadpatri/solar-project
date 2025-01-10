import { createSlice } from '@reduxjs/toolkit';

const userIdSlice = createSlice({
  name: 'userId',
  initialState: {
    userId: '',
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    clearUserId: (state) => {
      state.userId = '';
    },
  },
});

export const { setUserId, clearUserId } = userIdSlice.actions;
export default userIdSlice.reducer;
