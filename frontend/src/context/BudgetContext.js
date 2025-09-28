import { createContext, useContext, useReducer } from "react";
import budgetService from "../services/budgetService";

const BudgetContext = createContext();

const budgetReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_BUDGETS":
      return { ...state, budgets: action.payload, loading: false };
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [action.payload, ...state.budgets],
        loading: false,
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget._id === action.payload._id ? action.payload : budget
        ),
        loading: false,
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter(
          (budget) => budget._id !== action.payload
        ),
        loading: false,
      };
    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload, loading: false };
    case "SET_ALERTS":
      return { ...state, alerts: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState = {
  budgets: [],
  analytics: null,
  alerts: [],
  loading: false,
  error: null,
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const getBudgets = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await budgetService.getBudgets(filters);
      dispatch({ type: "SET_BUDGETS", payload: response.data });
    } catch (error) {
      setError(error.message);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      setLoading(true);
      const response = await budgetService.createBudget(budgetData);
      dispatch({ type: "ADD_BUDGET", payload: response.data });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateBudget = async (id, budgetData) => {
    try {
      setLoading(true);
      const response = await budgetService.updateBudget(id, budgetData);
      dispatch({ type: "UPDATE_BUDGET", payload: response.data });
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      setLoading(true);
      await budgetService.deleteBudget(id);
      dispatch({ type: "DELETE_BUDGET", payload: id });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getAnalytics = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getAnalytics();
      dispatch({ type: "SET_ANALYTICS", payload: response.data });
    } catch (error) {
      setError(error.message);
    }
  };

  const getAlerts = async () => {
    try {
      const response = await budgetService.getAlerts();
      dispatch({ type: "SET_ALERTS", payload: response.data.alerts });
    } catch (error) {
      setError(error.message);
    }
  };

  const value = {
    budgets: state.budgets,
    analytics: state.analytics,
    alerts: state.alerts,
    loading: state.loading,
    error: state.error,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getAnalytics,
    getAlerts,
    clearError,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgets must be used within BudgetProvider");
  }
  return context;
};
