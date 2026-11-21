import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./authSlice";
import { setupApi } from "../api/client";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setupApi({
  tokenGetter: () => store.getState().auth.token,
  unauthorizedHandler: () => store.dispatch(logout()),
});

export default store;
