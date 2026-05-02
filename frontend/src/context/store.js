import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import taskReducer from './taskSlice';
import settingsReducer from './settingsSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    settings: settingsReducer,
    notifications: notificationReducer,
  },
});

export default store;