import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    token: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.currentUser = null;
      state.token = null;
    },
    setUser(state, action) {
      state.currentUser = action.payload;
    },
  },
});

export const { loginSuccess, logout, setUser } = userSlice.actions;
export default userSlice.reducer;
