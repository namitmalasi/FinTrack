import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { useBudgets } from "../../context/BudgetContext.jsx";
import Alert from "../common/Alert";

const AddBudgetModal = ({
  isOpen,
  onClose,
  onBudgetAdded,
  editBudget = null,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
    startDate: "",
    endDate: "",
    alertThreshold: "80",
  });

  const { createBudget, updateBudget, loading, error, clearError } =
    useBudgets();

  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Home & Garden",
    "Personal Care",
    "Gifts & Donations",
    "Investment",
    "Other",
  ];

  const periods = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  useEffect(() => {
    if (editBudget) {
      setFormData({
        category: editBudget.category,
        amount: editBudget.amount.toString(),
        period: editBudget.period,
        startDate: editBudget.startDate.split("T")[0],
        endDate: editBudget.endDate.split("T")[0],
        alertThreshold: editBudget.alertThreshold.toString(),
      });
    } else {
      // Set default dates based on current date and period
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setFormData({
        category: "",
        amount: "",
        period: "monthly",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        alertThreshold: "80",
      });
    }
    clearError();
  }, [editBudget, isOpen, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-adjust dates when period changes
    if (name === "period" && !editBudget) {
      const now = new Date();
      let startDate, endDate;

      switch (value) {
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // Start of week
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // End of week
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "quarterly":
          var quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          return;
      }

      setFormData((prev) => ({
        ...prev,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        alertThreshold: parseInt(formData.alertThreshold),
      };

      if (editBudget) {
        await updateBudget(editBudget._id, budgetData);
      } else {
        await createBudget(budgetData);
      }

      onBudgetAdded();
    } catch (error) {
      console.error("Failed to save budget:", error.message);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days;
    }
    return 0;
  };

  const calculateDailyBudget = () => {
    const days = calculateDays();
    if (days > 0 && formData.amount) {
      return (parseFloat(formData.amount) / days).toFixed(2);
    }
    return "0.00";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editBudget ? "Edit Budget" : "Create New Budget"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={clearError} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Budget Amount *
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
        </div>

        <div>
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700"
          >
            Budget Period *
          </label>
          <select
            id="period"
            name="period"
            required
            className="input-field mt-1"
            value={formData.period}
            onChange={handleChange}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              className="input-field mt-1"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              required
              className="input-field mt-1"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="alertThreshold"
            className="block text-sm font-medium text-gray-700"
          >
            Alert Threshold (%)
          </label>
          <input
            type="number"
            id="alertThreshold"
            name="alertThreshold"
            min="1"
            max="100"
            className="input-field mt-1"
            value={formData.alertThreshold}
            onChange={handleChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Get notified when you've spent this percentage of your budget
          </p>
        </div>

        {/* Budget Summary */}
        {formData.amount && formData.startDate && formData.endDate && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Budget Summary
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Total Budget:</span>
                <span className="font-medium">
                  ${parseFloat(formData.amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{calculateDays()} days</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Budget:</span>
                <span className="font-medium">
                  ${calculateDailyBudget()}/day
                </span>
              </div>
            </div>
          </div>
        )}

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
              !formData.category ||
              !formData.amount ||
              !formData.startDate ||
              !formData.endDate
            }
          >
            {loading
              ? "Saving..."
              : editBudget
              ? "Update Budget"
              : "Create Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBudgetModal;
