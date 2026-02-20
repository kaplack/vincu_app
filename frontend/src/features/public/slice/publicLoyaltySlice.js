import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  joinBySlug,
  consultaLogin,
  consultaCards,
  getByPublicToken,
  setCustomerToken,
  clearCustomerToken,
  getCustomerToken,
} from "@/features/public/api/publicLoyaltyApi";

export const joinBySlugThunk = createAsyncThunk(
  "publicLoyalty/joinBySlug",
  async ({ slug, payload }, { rejectWithValue }) => {
    try {
      return await joinBySlug(slug, payload);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const consultaLoginThunk = createAsyncThunk(
  "publicLoyalty/consultaLogin",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await consultaLogin(payload);

      // Tu backend devuelve { token }
      if (data?.token) {
        setCustomerToken(data.token);
      }

      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const consultaCardsThunk = createAsyncThunk(
  "publicLoyalty/consultaCards",
  async (_, { rejectWithValue }) => {
    try {
      return await consultaCards();
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

export const getByPublicTokenThunk = createAsyncThunk(
  "publicLoyalty/getByPublicToken",
  async ({ token }, { rejectWithValue }) => {
    try {
      return await getByPublicToken(token);
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Error");
    }
  },
);

const initialState = {
  status: "idle",
  error: null,

  joinResult: null, // { directLink, token, reused? }
  customerToken: getCustomerToken(),

  cards: [], // /consulta/cards
  publicCard: null, // /c/:token
};

const slice = createSlice({
  name: "publicLoyalty",
  initialState,
  reducers: {
    clearPublicLoyaltyError(state) {
      state.error = null;
    },
    logoutCustomer(state) {
      clearCustomerToken();
      state.customerToken = null;
      state.cards = [];
    },
    hydrateCustomerToken(state) {
      state.customerToken = getCustomerToken();
    },
  },
  extraReducers: (builder) => {
    builder
      // join
      .addCase(joinBySlugThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.joinResult = null;
      })
      .addCase(joinBySlugThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.joinResult = action.payload || null;
      })
      .addCase(joinBySlugThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error";
      })

      // consulta login
      .addCase(consultaLoginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(consultaLoginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customerToken = action.payload?.token || null;
      })
      .addCase(consultaLoginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Credenciales inválidas";
      })

      // consulta cards
      .addCase(consultaCardsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(consultaCardsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const data = action.payload;
        const items =
          (Array.isArray(data?.items) && data.items) ||
          (Array.isArray(data?.cards) && data.cards) ||
          (Array.isArray(data?.memberships) && data.memberships) ||
          [];
        state.cards = items;
      })
      .addCase(consultaCardsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Error";
      })

      // public card
      .addCase(getByPublicTokenThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.publicCard = null;
      })
      .addCase(getByPublicTokenThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.publicCard = action.payload || null;
      })
      .addCase(getByPublicTokenThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Link inválido o expirado";
      });
  },
});

export const { clearPublicLoyaltyError, logoutCustomer, hydrateCustomerToken } =
  slice.actions;

export default slice.reducer;

export const selectPublicLoyalty = (state) => state.publicLoyalty;
export const selectPublicStatus = (state) => state.publicLoyalty.status;
export const selectPublicError = (state) => state.publicLoyalty.error;
export const selectJoinResult = (state) => state.publicLoyalty.joinResult;
export const selectCustomerToken = (state) => state.publicLoyalty.customerToken;
export const selectCustomerCards = (state) => state.publicLoyalty.cards;
export const selectPublicCard = (state) => state.publicLoyalty.publicCard;
