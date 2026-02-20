import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listRewards,
  createReward,
  updateReward,
  archiveReward,
  deleteReward,
} from "../api/rewardApi";

export const fetchRewardsThunk = createAsyncThunk(
  "rewards/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      // Para tu pantalla Recompensas: queremos ver activas e inactivas (no archivadas)
      return await listRewards({
        includeInactive: "true",
        includeArchived: "false",
      });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to fetch rewards." },
      );
    }
  },
);

export const createRewardThunk = createAsyncThunk(
  "rewards/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createReward(payload); // { item }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to create reward." },
      );
    }
  },
);

export const updateRewardThunk = createAsyncThunk(
  "rewards/update",
  async ({ rewardId, payload }, { rejectWithValue }) => {
    try {
      return await updateReward(rewardId, payload); // { item }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to update reward." },
      );
    }
  },
);

export const archiveRewardThunk = createAsyncThunk(
  "rewards/archive",
  async (rewardId, { rejectWithValue }) => {
    try {
      return await archiveReward(rewardId); // { item }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to archive reward." },
      );
    }
  },
);

export const deleteRewardThunk = createAsyncThunk(
  "rewards/delete",
  async (rewardId, { rejectWithValue }) => {
    try {
      await deleteReward(rewardId);
      return { rewardId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to delete reward." },
      );
    }
  },
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const rewardsSlice = createSlice({
  name: "rewards",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchRewardsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRewardsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.items || [];
      })
      .addCase(fetchRewardsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error;
      })

      // Create
      .addCase(createRewardThunk.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (item) state.items = [item, ...state.items];
      })

      // Update / Archive
      .addCase(updateRewardThunk.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (!item) return;
        state.items = state.items.map((r) => (r.id === item.id ? item : r));
      })
      .addCase(archiveRewardThunk.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (!item) return;
        // Como por defecto NO mostramos archivadas, la removemos del listado:
        state.items = state.items.filter((r) => r.id !== item.id);
      })

      // Delete
      .addCase(deleteRewardThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (r) => r.id !== action.payload.rewardId,
        );
      });
  },
});

export default rewardsSlice.reducer;

export const selectRewards = (state) => state.rewards.items;
export const selectRewardsStatus = (state) => state.rewards.status;
export const selectRewardsError = (state) => state.rewards.error;
