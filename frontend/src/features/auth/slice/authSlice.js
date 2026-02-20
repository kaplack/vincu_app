// src/features/auth/slice/authSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authApi from "../api/authApi";

const TOKEN_KEY = "vincu_token";

// Thunks
export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authApi.register(payload);
      return data; // { token, user, ... }
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authApi.login(payload);
      return data; // { token, user, ... }
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  },
);

export const loadSessionThunk = createAsyncThunk(
  "auth/loadSession",
  async (_payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return { token: null, user: null };

      const data = await authApi.me(); // { user, ... }
      return { token, ...data };
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue(err?.response?.data || { message: err.message });
    }
  },
);

// Slice
const initialState = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  status: "idle", // idle | loading | restoring | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) localStorage.setItem(TOKEN_KEY, action.payload);
      else localStorage.removeItem(TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    // register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;

        localStorage.setItem(TOKEN_KEY, action.payload.token);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Register failed";
      });

    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;

        localStorage.setItem(TOKEN_KEY, action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Login failed";
      });

    // loadSession
    builder
      .addCase(loadSessionThunk.pending, (state) => {
        state.status = "restoring";
        state.error = null;
      })
      .addCase(loadSessionThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loadSessionThunk.rejected, (state, action) => {
        state.status = "failed";
        state.token = null;
        state.user = null;
        state.error = action.payload?.message || "Session load failed";
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
