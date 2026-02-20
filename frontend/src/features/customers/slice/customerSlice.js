import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  listCustomers,
  getMembershipDetail,
  getByQrToken,
  listTransactions,
} from "../api/customerApi";

export const fetchCustomersThunk = createAsyncThunk(
  "customers/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      return await listCustomers(); // { items }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to fetch customers." },
      );
    }
  },
);

export const fetchMembershipDetailThunk = createAsyncThunk(
  "customers/fetchDetail",
  async (membershipId, { rejectWithValue }) => {
    try {
      return await getMembershipDetail(membershipId); // { item }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || {
          message: "Failed to fetch membership detail.",
        },
      );
    }
  },
);

export const fetchByQrTokenThunk = createAsyncThunk(
  "customers/fetchByQr",
  async (qrToken, { rejectWithValue }) => {
    try {
      return await getByQrToken(qrToken); // { item }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "QR not found." },
      );
    }
  },
);

export const fetchTransactionsThunk = createAsyncThunk(
  "customers/fetchTransactions",
  async (membershipId, { rejectWithValue }) => {
    try {
      const res = await listTransactions(membershipId); // { items }
      return { membershipId, ...res };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "Failed to fetch transactions." },
      );
    }
  },
);

const initialState = {
  items: [],
  status: "idle",
  error: null,

  selected: null, // detail payload (same shape as row mapping)
  selectedStatus: "idle",
  selectedError: null,

  transactionsByMembershipId: {},
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.selectedStatus = "idle";
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.items || [];
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error;
      })

      // Detail
      .addCase(fetchMembershipDetailThunk.pending, (state) => {
        state.selectedStatus = "loading";
        state.selectedError = null;
      })
      .addCase(fetchMembershipDetailThunk.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload?.item || null;
      })
      .addCase(fetchMembershipDetailThunk.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.payload || action.error;
      })

      // QR lookup (stores into selected)
      .addCase(fetchByQrTokenThunk.pending, (state) => {
        state.selectedStatus = "loading";
        state.selectedError = null;
      })
      .addCase(fetchByQrTokenThunk.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload?.item || null;
      })
      .addCase(fetchByQrTokenThunk.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.payload || action.error;
      })

      // Transactions
      .addCase(fetchTransactionsThunk.pending, (state, action) => {
        const membershipId = action.meta.arg;
        state.transactionsByMembershipId[membershipId] = {
          items: [],
          status: "loading",
          error: null,
        };
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        const { membershipId, items } = action.payload;
        state.transactionsByMembershipId[membershipId] = {
          items: items || [],
          status: "succeeded",
          error: null,
        };
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        const membershipId = action.meta.arg;
        state.transactionsByMembershipId[membershipId] = {
          items: [],
          status: "failed",
          error: action.payload || action.error,
        };
      });
  },
});

export const { clearSelected } = customersSlice.actions;

export default customersSlice.reducer;

export const selectCustomers = (state) => state.customers.items;
export const selectCustomersStatus = (state) => state.customers.status;
export const selectSelectedCustomer = (state) => state.customers.selected;
export const selectSelectedCustomerStatus = (state) =>
  state.customers.selectedStatus;

export const selectTransactionsByMembershipId = (membershipId) => (state) =>
  state.customers.transactionsByMembershipId[membershipId] || {
    items: [],
    status: "idle",
    error: null,
  };
