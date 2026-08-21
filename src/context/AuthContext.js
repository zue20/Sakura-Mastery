import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase } from '../api/supabaseClient';
import { fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext(undefined);

const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'BOOTSTRAP_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_FAILURE':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload || null };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    async function bootstrap() {
      dispatch({ type: 'BOOTSTRAP_START' });
      try {
        const user = await fetchCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (err) {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    }
    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: session.user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}