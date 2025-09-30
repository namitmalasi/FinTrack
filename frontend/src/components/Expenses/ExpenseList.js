import { useState } from "react";
import AddExpenseModal from "./AddExpenseModal";

const ExpenseList = ({ expenses, onEdit, onDelete, loading }) => {
  const [editingExpense, setEditingExpense] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Food & Dining": "bg-red-100 text-red-800",
      Transportation: "bg-blue-100 text-blue-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Shopping: "bg-pink-100 text-pink-800",
      "Bills & Utilities": "bg-yellow-100 text-yellow-800",
      Healthcare: "bg-green-100 text-green-800",
      Education: "bg-indigo-100 text-indigo-800",
      Travel: "bg-cyan-100 text-cyan-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors["Other"];
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleCloseModal = () => {
    setEditingExpense(null);
  };

  const handleExpenseUpdated = () => {
    setEditingExpense(null);
    onEdit(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No expenses found
        </h3>
        <p className="text-gray-600 mb-4">
          Start tracking your expenses to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {expense.description}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Edit expense"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(expense._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                  <span>{formatDate(expense.date)}</span>
                  {expense.isRecurring && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      🔄 {expense.recurringPeriod}
                    </span>
                  )}
                </div>

                {expense.tags && expense.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {expense.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingExpense && (
        <AddExpenseModal
          isOpen={!!editingExpense}
          onClose={handleCloseModal}
          onExpenseAdded={handleExpenseUpdated}
          editExpense={editingExpense}
        />
      )}
    </>
  );
};

export default ExpenseList;
