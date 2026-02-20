// frontend/src/features/settings/slice/businessSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listBusinesses,
  createBusiness as apiCreateBusiness,
  createBranch as apiCreateBranch,
  updateBusiness as apiUpdateBusiness,
  setCurrentBusiness as apiSetCurrentBusiness,
} from "@/features/settings/api/businessApi";

// --- Thunks ---
export const fetchBusinessesThunk = createAsyncThunk(
  "business/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await listBusinesses();
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const createBusinessThunk = createAsyncThunk(
  "business/createBusiness",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiCreateBusiness(payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const createBranchThunk = createAsyncThunk(
  "business/createBranch",
  async ({ businessId, payload }, { rejectWithValue }) => {
    try {
      return await apiCreateBranch(businessId, payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const updateBusinessThunk = createAsyncThunk(
  "business/updateBusiness",
  async ({ businessId, patch }, { rejectWithValue }) => {
    try {
      return await apiUpdateBusiness(businessId, patch);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const switchBusinessThunk = createAsyncThunk(
  "business/switchBusiness",
  async (businessId, { rejectWithValue }) => {
    try {
      const confirmedId = await apiSetCurrentBusiness(businessId);
      return confirmedId; // businessId confirmado por backend
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

// --- Slice ---
const initialState = {
  items: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,

  // Optional UI helpers
  selectedBusinessId: null,
  selectedBranchId: null,
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setSelectedBusinessId(state, action) {
      state.selectedBusinessId = action.payload || null;
      state.selectedBranchId = null; // reset sucursal
    },
    setSelectedBranchId(state, action) {
      state.selectedBranchId = action.payload ?? null;
    },
    clearBusinessError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchBusinessesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBusinessesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];

        const principals = state.items.filter((b) => !b.parentId);

        if (
          state.selectedBusinessId &&
          !principals.some((b) => b.id === state.selectedBusinessId)
        ) {
          state.selectedBusinessId = null;
        }
      })
      .addCase(fetchBusinessesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error";
      })

      // create business
      .addCase(createBusinessThunk.fulfilled, (state, action) => {
        const created = action.payload;
        if (!created?.id) return;

        // Put principal at top
        state.items = [created, ...state.items];

        // auto select
        state.selectedBusinessId = created.id;
      })
      .addCase(createBusinessThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })

      // create branch
      .addCase(createBranchThunk.fulfilled, (state, action) => {
        const created = action.payload;
        if (!created?.id) return;

        state.items = [created, ...state.items];
      })
      .addCase(createBranchThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })

      // update business
      .addCase(updateBusinessThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;

        state.items = state.items.map((b) =>
          b.id === updated.id ? updated : b,
        );
      })
      .addCase(updateBusinessThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })

      // switch business
      .addCase(switchBusinessThunk.fulfilled, (state, action) => {
        state.selectedBusinessId = action.payload || null;
        state.selectedBranchId = null;
      })
      .addCase(switchBusinessThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      });
  },
});

export const {
  setSelectedBusinessId,
  setSelectedBranchId,
  clearBusinessError,
} = businessSlice.actions;

export default businessSlice.reducer;

// --- Selectors ---
export const selectBusinesses = (state) => state.business.items;
export const selectBusinessStatus = (state) => state.business.status;
export const selectBusinessError = (state) => state.business.error;
export const selectSelectedBusinessId = (state) =>
  state.business.selectedBusinessId;
export const selectSelectedBranchId = (state) =>
  state.business.selectedBranchId;
