import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = { user: null, loading: true };

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        dispatch({ type: 'SET_USER', payload: data.user });
      } catch {
        dispatch({ type: 'CLEAR_USER' });
      }
    };
    checkAuth();
  }, []);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    dispatch({ type: 'SET_USER', payload: data.user });
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    dispatch({ type: 'SET_USER', payload: data.user });
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    dispatch({ type: 'CLEAR_USER' });
    toast.success('Logged out successfully.');
  };

  const updateUser = (updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
