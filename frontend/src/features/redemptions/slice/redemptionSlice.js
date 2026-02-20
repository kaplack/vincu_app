import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listRedemptions,
  consumeRedemption,
  cancelRedemption,
} from "../api/redemptionApi";
import { selectSelectedBranchId } from "@/features/settings/slice/businessSlice";

export const fetchRedemptionsThunk = createAsyncThunk(
  "redemptions/fetchList",
  async ({ status, q }, { rejectWithValue }) => {
    try {
      return await listRedemptions({
        status, // "issued" | "redeemed"
        q: q?.trim() || undefined,
      });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to fetch redemptions." },
      );
    }
  },
);

export const consumeRedemptionThunk = createAsyncThunk(
  "redemptions/consume",
  async ({ redeemCode }, { getState, rejectWithValue }) => {
    try {
      const branchId = selectSelectedBranchId(getState());
      if (!branchId) {
        return rejectWithValue({
          message: "Selecciona una sucursal antes de validar canjes.",
          code: "BRANCH_REQUIRED_UI",
        });
      }

      return await consumeRedemption({ redeemCode, branchId });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to consume redemption." },
      );
    }
  },
);

export const cancelRedemptionThunk = createAsyncThunk(
  "redemptions/cancel",
  async (
    { redeemCode, reasonCode, reasonText },
    { getState, rejectWithValue },
  ) => {
    try {
      const branchId = selectSelectedBranchId(getState());
      if (!branchId) {
        return rejectWithValue({
          message: "Selecciona una sucursal antes de anular canjes.",
          code: "BRANCH_REQUIRED_UI",
        });
      }

      return await cancelRedemption({
        redeemCode,
        reasonCode,
        reasonText,
        branchId,
      });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to cancel redemption." },
      );
    }
  },
);

const initialState = {
  issued: [],
  redeemed: [],
  status: "idle",
  error: null,
  lastQuery: { issued: "", redeemed: "" },
};

function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const copy = [...list];
  copy[idx] = item;
  return copy;
}

const redemptionSlice = createSlice({
  name: "redemptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRedemptionsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRedemptionsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { status } = action.meta.arg;
        const items = action.payload?.items || [];
        if (status === "issued") state.issued = items;
        if (status === "redeemed") state.redeemed = items;

        const q = action.meta.arg.q?.trim() || "";
        state.lastQuery[status] = q;
      })
      .addCase(fetchRedemptionsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error;
      })

      // consume => mueve issued -> redeemed
      .addCase(consumeRedemptionThunk.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (!item?.id) return;
        state.issued = state.issued.filter((x) => x.id !== item.id);
        state.redeemed = upsertById(state.redeemed, item);
      })

      // cancel => saca de issued (y si luego haces tab cancelled, ya lo traerás con fetch)
      .addCase(cancelRedemptionThunk.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (!item?.id) return;
        state.issued = state.issued.filter((x) => x.id !== item.id);
      });
  },
});

export default redemptionSlice.reducer;

export const selectIssuedRedemptions = (state) => state.redemptions.issued;
export const selectRedeemedRedemptions = (state) => state.redemptions.redeemed;
export const selectRedemptionsStatus = (state) => state.redemptions.status;
export const selectRedemptionsError = (state) => state.redemptions.error;
