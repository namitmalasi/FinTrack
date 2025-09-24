import api from "./api";

export const budgetService = {
  getBudgets: async () => {
    try {
      const response = await api.get("/budgets");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch budgets"
      );
    }
  },

  createBudget: async (budgetData) => {
    try {
      const response = await api.post("/budgets", budgetData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create budget"
      );
    }
  },

  updateBudget: async (id, budgetData) => {
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update budget"
      );
    }
  },

  deleteBudget: async (id) => {
    try {
      const response = await api.delete(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete budget"
      );
    }
  },
};
