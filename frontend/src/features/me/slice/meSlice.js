// src/features/me/slice/meSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getMyMemberships,
  getMembershipTransactions,
  getBusinessRewards,
  createRedemption,
  getRedemptionById,
} from "@/features/me/api/meApi";

export const fetchMyMembershipsThunk = createAsyncThunk(
  "me/fetchMemberships",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyMemberships();
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const fetchMembershipTxThunk = createAsyncThunk(
  "me/fetchMembershipTx",
  async ({ membershipId }, { rejectWithValue }) => {
    try {
      return await getMembershipTransactions(membershipId);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const fetchBusinessRewardsThunk = createAsyncThunk(
  "me/fetchBusinessRewards",
  async ({ businessId }, { rejectWithValue }) => {
    try {
      return await getBusinessRewards(businessId);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const createRedemptionThunk = createAsyncThunk(
  "me/createRedemption",
  async (payload, { rejectWithValue }) => {
    try {
      return await createRedemption(payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const fetchRedemptionByIdThunk = createAsyncThunk(
  "me/fetchRedemptionById",
  async ({ redemptionId }, { rejectWithValue }) => {
    try {
      return await getRedemptionById(redemptionId);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

const ACTIVE_MEMBERSHIP_KEY = "vincu_active_membership_id";

function loadActiveMembershipId() {
  return localStorage.getItem(ACTIVE_MEMBERSHIP_KEY);
}

function saveActiveMembershipId(id) {
  if (!id) return localStorage.removeItem(ACTIVE_MEMBERSHIP_KEY);
  localStorage.setItem(ACTIVE_MEMBERSHIP_KEY, id);
}

const initialState = {
  status: "idle",
  error: null,

  memberships: [],
  activeMembershipId: loadActiveMembershipId(),

  transactionsByMembershipId: {},
  rewardsByBusinessId: {},

  currentRedemption: null,
};

const slice = createSlice({
  name: "me",
  initialState,
  reducers: {
    setActiveMembership(state, action) {
      state.activeMembershipId = action.payload || null;
      saveActiveMembershipId(state.activeMembershipId);
    },
    clearMeError(state) {
      state.error = null;
    },
    clearCurrentRedemption(state) {
      state.currentRedemption = null;
    },
    resetMeState(state) {
      // (opcional) lo usarás en logout del customer
      state.status = "idle";
      state.error = null;
      state.memberships = [];
      state.activeMembershipId = null;
      state.transactionsByMembershipId = {};
      state.rewardsByBusinessId = {};
      state.currentRedemption = null;
      saveActiveMembershipId(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyMembershipsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyMembershipsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.memberships = action.payload?.memberships || [];

        // si no hay activeMembershipId o ya no existe, setear el primero
        const exists = state.memberships.some(
          (m) => m.id === state.activeMembershipId,
        );
        if (!state.activeMembershipId || !exists) {
          state.activeMembershipId = state.memberships[0]?.id || null;
          saveActiveMembershipId(state.activeMembershipId);
        }
      })
      .addCase(fetchMyMembershipsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error";
      })

      .addCase(fetchMembershipTxThunk.fulfilled, (state, action) => {
        const membershipId = action.payload?.membershipId;
        if (membershipId) {
          state.transactionsByMembershipId[membershipId] =
            action.payload?.transactions || [];
        }
      })

      .addCase(fetchBusinessRewardsThunk.fulfilled, (state, action) => {
        const businessId = action.payload?.businessId;
        if (businessId) {
          state.rewardsByBusinessId[businessId] = action.payload;
        }
      })

      .addCase(createRedemptionThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(createRedemptionThunk.fulfilled, (state, action) => {
        state.currentRedemption = action.payload?.redemption || null;

        // actualizar balance en memberships si viene newBalance
        const newBalance = action.payload?.newBalance;
        const activeId = state.activeMembershipId;
        if (activeId && typeof newBalance === "number") {
          const idx = state.memberships.findIndex((m) => m.id === activeId);
          if (idx >= 0) state.memberships[idx].pointsBalance = newBalance;
        }
      })
      .addCase(createRedemptionThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })
      .addCase(fetchRedemptionByIdThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRedemptionByIdThunk.fulfilled, (state, action) => {
        state.currentRedemption = action.payload?.redemption || null;
      })
      .addCase(fetchRedemptionByIdThunk.rejected, (state, action) => {
        state.error = action.payload || "Error";
      });
  },
});

export const {
  setActiveMembership,
  clearMeError,
  clearCurrentRedemption,
  resetMeState,
} = slice.actions;

export default slice.reducer;

// selectors
export const selectMe = (s) => s.me;
export const selectMyMemberships = (s) => s.me.memberships;
export const selectActiveMembershipId = (s) => s.me.activeMembershipId;
export const selectActiveMembership = (s) =>
  s.me.memberships.find((m) => m.id === s.me.activeMembershipId) || null;

export const selectTxForActiveMembership = (s) => {
  const m = s.me.activeMembershipId;
  return m ? s.me.transactionsByMembershipId[m] || [] : [];
};
