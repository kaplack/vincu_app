// frontend/src/features/settings/slice/walletCardSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { walletCardService } from "../api/walletCardApi";

export const fetchWalletCardConfig = createAsyncThunk(
  "walletCard/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      return await walletCardService.getConfig();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Error fetching wallet card config" },
      );
    }
  },
);

export const saveWalletCardBranding = createAsyncThunk(
  "walletCard/saveBranding",
  async (payload, { rejectWithValue }) => {
    try {
      return await walletCardService.updateBranding(payload);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Error saving branding" },
      );
    }
  },
);

const walletCardSlice = createSlice({
  name: "walletCard",
  initialState: {
    config: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearWalletCardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletCardConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletCardConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchWalletCardConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveWalletCardBranding.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveWalletCardBranding.fulfilled, (state, action) => {
        state.saving = false;
        state.config = action.payload; // backend retorna config actualizada
      })
      .addCase(saveWalletCardBranding.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletCardError } = walletCardSlice.actions;
export default walletCardSlice.reducer;
