import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { useExpenses } from "../../context/ExpenseContext";
import Alert from "../common/Alert";

const AddExpenseModal = ({
  isOpen,
  onClose,
  onExpenseAdded,
  editExpense = null,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurringPeriod: "",
    tags: "",
  });

  const {
    categories,
    createExpense,
    updateExpense,
    getCategories,
    loading,
    error,
    clearError,
  } = useExpenses();

  useEffect(() => {
    if (categories.length === 0) {
      getCategories();
    }
  }, []);

  useEffect(() => {
    if (editExpense) {
      setFormData({
        amount: editExpense.amount.toString(),
        category: editExpense.category,
        description: editExpense.description,
        date: editExpense.date.split("T")[0],
        isRecurring: editExpense.isRecurring || false,
        recurringPeriod: editExpense.recurringPeriod || "",
        tags: editExpense.tags ? editExpense.tags.join(", ") : "",
      });
    } else {
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false,
        recurringPeriod: "",
        tags: "",
      });
    }
    clearError();
  }, [editExpense, isOpen, clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringPeriod: formData.isRecurring
          ? formData.recurringPeriod
          : undefined,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      if (editExpense) {
        await updateExpense(editExpense._id, expenseData);
      } else {
        await createExpense(expenseData);
      }

      onExpenseAdded();
    } catch (error) {
      // Error is handled by context
      console.error("Failed to save expense:", error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExpense ? "Edit Expense" : "Add New Expense"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={clearError} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0.01"
              step="0.01"
              className="input-field mt-1"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              className="input-field mt-1"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            maxLength="200"
            className="input-field mt-1"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this expense for?"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            className="input-field mt-1"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.isRecurring}
            onChange={handleChange}
          />
          <label
            htmlFor="isRecurring"
            className="ml-2 block text-sm text-gray-900"
          >
            This is a recurring expense
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label
              htmlFor="recurringPeriod"
              className="block text-sm font-medium text-gray-700"
            >
              Recurring Period
            </label>
            <select
              id="recurringPeriod"
              name="recurringPeriod"
              className="input-field mt-1"
              value={formData.recurringPeriod}
              onChange={handleChange}
              required={formData.isRecurring}
            >
              <option value="">Select period</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700"
          >
            Tags (optional)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="input-field mt-1"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Separate tags with commas"
          />
          <p className="mt-1 text-xs text-gray-500">
            e.g., work lunch, client meeting, travel
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={
              loading ||
              !formData.amount ||
              !formData.category ||
              !formData.description
            }
          >
            {loading
              ? "Saving..."
              : editExpense
              ? "Update Expense"
              : "Add Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
