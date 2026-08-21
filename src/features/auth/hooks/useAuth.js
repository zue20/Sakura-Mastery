import { useCallback } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import {
  loginRequest,
  signupRequest,
  logoutRequest,
  forgotPasswordRequest,
} from '../../../api/authApi';

export default function useAuth() {
  const { state, dispatch } = useAuthContext();

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const user = await loginRequest({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Invalid credentials. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const signup = useCallback(async ({ name, email, password }) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      const user = await signupRequest({ name, email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Could not create account. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatch]);

  const forgotPassword = useCallback(async ({ email }) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await forgotPasswordRequest({ email });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Could not send reset email. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    logout,
    forgotPassword,
    clearError,
  };
}