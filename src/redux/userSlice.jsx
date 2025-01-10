// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: '',
    email: '',
  },
  reducers: {
    setUser(state, action) {
      const { username, email } = action.payload;
      state.username = username;
      state.email = email;
    },
    clearUser(state) {
      state.username = '';
      state.email = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
