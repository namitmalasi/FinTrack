// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, loading: false, user: action.payload, error: null };
    case "LOGIN_FAILURE":
      return { ...state, loading: false, user: null, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, loading: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authService.validateToken();
          dispatch({ type: "LOGIN_SUCCESS", payload: userData });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "LOGIN_FAILURE", payload: "Session expired" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.register(name, email, password);
      localStorage.setItem("token", response.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
