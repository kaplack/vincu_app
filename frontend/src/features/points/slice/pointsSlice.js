// frontend/src/features/points/slice/pointsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createPointsTx } from "../api/pointsApi";

export const createPointsTxThunk = createAsyncThunk(
  "points/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createPointsTx(payload); // { item, pointsBalance }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || {
          message: "Failed to create points transaction.",
        },
      );
    }
  },
);

const pointsSlice = createSlice({
  name: "points",
  initialState: {
    createStatus: "idle", // idle | loading | succeeded | failed
    createError: null,
    lastResult: null, // { item, pointsBalance }
  },
  reducers: {
    clearPointsCreateState(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPointsTxThunk.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
        state.lastResult = null;
      })
      .addCase(createPointsTxThunk.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.lastResult = action.payload || null;
      })
      .addCase(createPointsTxThunk.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error;
      });
  },
});

export const { clearPointsCreateState } = pointsSlice.actions;

export default pointsSlice.reducer;

export const selectPointsCreateStatus = (state) => state.points.createStatus;
export const selectPointsCreateError = (state) => state.points.createError;
export const selectPointsLastResult = (state) => state.points.lastResult;
