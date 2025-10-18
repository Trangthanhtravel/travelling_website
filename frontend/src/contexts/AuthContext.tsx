import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI, adminAPI_functions } from '../utils/api';

interface AuthState {
  admin: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'SET_LOADING' | 'RESTORE_SESSION';
  payload?: any;
}

const initialState: AuthState = {
  admin: null,
  token: localStorage.getItem('adminToken'),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('adminToken'),
};

const AuthContext = createContext<{
  state: AuthState;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  state: initialState,
  adminLogin: async () => {},
  logout: () => {},
});

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        admin: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        admin: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        admin: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        admin: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (token) {
      // First, restore from localStorage immediately to prevent flash
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { user, token },
          });
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      // Then verify token is still valid in the background
      adminAPI_functions.getProfile()
        .then(response => {
          const user = response.data.data;
          // Update localStorage with fresh user data
          localStorage.setItem('adminUser', JSON.stringify(user));
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        })
        .catch((error) => {
          // Only logout if it's a 401/403 error (invalid token)
          // Don't logout on network errors or server errors
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token is invalid, logging out');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            dispatch({ type: 'LOGIN_FAILURE' });
          } else {
            // Keep the session on network/server errors
            console.log('Network/server error, keeping session:', error.message);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const adminLogin = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.adminLogin(email, password);

      console.log('🔍 Frontend - Full response:', response.data);

      // Backend now returns data in ApiResponse format: { success, message, data: { token, user } }
      const { token, user } = response.data.data;

      console.log('🔍 Frontend - Extracted:', { token: !!token, user: !!user });

      // Store both token and user data
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      console.error('🔍 Frontend - Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
