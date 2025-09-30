import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { expenseService } from "../services/expenseService";

const ExpenseContext = createContext();

const expenseReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_EXPENSES":
      return {
        ...state,
        expenses: action.payload.expenses,
        pagination: action.payload.pagination,
        summary: action.payload.summary,
        loading: false,
      };
    case "ADD_EXPENSE":
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        loading: false,
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        ),
        loading: false,
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense._id !== action.payload
        ),
        loading: false,
      };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState = {
  expenses: [],
  categories: [],
  analytics: null,
  pagination: null,
  summary: null,
  loading: false,
  error: null,
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const setLoading = useCallback((loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const getExpenses = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        const response = await expenseService.getExpenses(filters);
        dispatch({ type: "SET_EXPENSES", payload: response.data });
      } catch (error) {
        setError(error.message);
      }
    },
    [setLoading, setError]
  );

  const createExpense = useCallback(
    async (expenseData) => {
      try {
        setLoading(true);
        const response = await expenseService.createExpense(expenseData);
        dispatch({ type: "ADD_EXPENSE", payload: response.data });
        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [setLoading, setError]
  );

  const updateExpense = useCallback(
    async (id, expenseData) => {
      try {
        setLoading(true);
        const response = await expenseService.updateExpense(id, expenseData);
        dispatch({ type: "UPDATE_EXPENSE", payload: response.data });
        return response;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [setLoading, setError]
  );

  const deleteExpense = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await expenseService.deleteExpense(id);
        dispatch({ type: "DELETE_EXPENSE", payload: id });
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [setLoading, setError]
  );

  const getCategories = useCallback(async () => {
    try {
      const response = await expenseService.getCategories();
      dispatch({ type: "SET_CATEGORIES", payload: response.data });
    } catch (error) {
      setError(error.message);
    }
  }, [setError]);

  const getAnalytics = useCallback(
    async (period = "month") => {
      try {
        setLoading(true);
        const response = await expenseService.getAnalytics(period);
        dispatch({ type: "SET_ANALYTICS", payload: response.data });
      } catch (error) {
        setError(error.message);
      }
    },
    [setLoading, setError]
  );

  const value = {
    expenses: state.expenses,
    categories: state.categories,
    analytics: state.analytics,
    pagination: state.pagination,
    summary: state.summary,
    loading: state.loading,
    error: state.error,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getCategories,
    getAnalytics,
    clearError,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
};
