import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import membersReducer from '../features/members/membersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
