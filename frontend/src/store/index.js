// frontend/src/store/index.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import authReducer, { logout } from "../features/auth/slice/authSlice";
import businessReducer from "../features/settings/slice/businessSlice";
import walletCardReducer from "../features/settings/slice/walletCardSlice";
import publicLoyaltyReducer from "@/features/public/slice/publicLoyaltySlice";
import customersReducer from "@/features/customers/slice/customerSlice";
import pointsReducer from "@/features/points/slice/pointsSlice";
import rewardReducer from "@/features/rewards/slice/rewardSlice";
import meReducer from "@/features/me/slice/meSlice";
import redemptionsReducer from "../features/redemptions/slice/redemptionSlice";

const appReducer = combineReducers({
  auth: authReducer,
  business: businessReducer,
  walletCard: walletCardReducer,
  publicLoyalty: publicLoyaltyReducer,
  customers: customersReducer,
  points: pointsReducer,
  rewards: rewardReducer,
  redemptions: redemptionsReducer,
  me: meReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    state = undefined; // ← resetea TODO el store
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export const selectAuth = (state) => state.auth;
