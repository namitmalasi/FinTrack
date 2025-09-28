import api from "./api";

export const expenseService = {
  getExpenses: async (params = {}) => {
    try {
      const response = await api.get("/expenses", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch expenses"
      );
    }
  },

  getExpenseById: async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch expense"
      );
    }
  },

  createExpense: async (expenseData) => {
    try {
      const response = await api.post("/expenses", expenseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create expense"
      );
    }
  },

  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update expense"
      );
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get("/expenses/categories/list");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  },

  getAnalytics: async (period = "month") => {
    try {
      const response = await api.get(
        `/expenses/analytics/summary?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    }
  },
};
