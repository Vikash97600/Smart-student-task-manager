import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import App from './App';
import store from './context/store';
import { checkAuthStart, checkAuthSuccess, checkAuthFailure } from './context/authSlice';
import { fetchSettings } from './context/settingsSlice';
import { authService } from './services/api';
import SettingsProvider from './context/SettingsProvider';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyAuth = async () => {
      dispatch(checkAuthStart());
      try {
        const response = await authService.checkAuth();
        if (response && response.success) {
          dispatch(checkAuthSuccess(response.data));
          // Fetch user settings after successful auth
          dispatch(fetchSettings());
        } else {
          dispatch(checkAuthFailure());
        }
      } catch (error) {
        // Error means auth check failed - user is not authenticated
        dispatch(checkAuthFailure());
      }
    };
    verifyAuth();
  }, [dispatch]);

  return children;
};

const SettingsInitializer = ({ children }) => {
  
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <SettingsProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </SettingsProvider>
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
