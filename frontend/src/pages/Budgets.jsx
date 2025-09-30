// frontend/src/pages/Budgets.js
import { useEffect, useState } from "react";
import { useBudgets } from "../context/BudgetContext.jsx";
import BudgetCard from "../components/Budgets/BudgetCard";
import AddBudgetModal from "../components/Budgets/AddBudgetModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";

const Budgets = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  const {
    budgets,
    analytics,
    loading,
    error,
    getBudgets,
    updateBudget,
    deleteBudget,
    getAnalytics,
    clearError,
  } = useBudgets();

  useEffect(() => {
    getBudgets();
    getAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleBudgetAdded = () => {
    setShowAddModal(false);
    setEditingBudget(null);
    getBudgets();
    getAnalytics();
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowAddModal(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(id);
        getAnalytics(); // Refresh analytics
      } catch (error) {
        console.error("Failed to delete budget:", error.message);
      }
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await updateBudget(id, { isActive });
      getAnalytics(); // Refresh analytics
    } catch (error) {
      console.error("Failed to update budget status:", error.message);
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    if (filter === "active") return budget.isActive;
    if (filter === "inactive") return !budget.isActive;
    return true;
  });

  const activeBudgets = budgets.filter((b) => b.isActive);
  const overBudgetCount = activeBudgets.filter((b) => b.isOverBudget).length;
  const nearLimitCount = activeBudgets.filter(
    (b) => b.percentageUsed >= b.alertThreshold && !b.isOverBudget
  ).length;

  if (loading && !budgets.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-2 text-gray-600">
            Manage your spending limits and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          Create Budget
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Summary Cards */}
      {analytics?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Budgeted
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(analytics.summary.totalBudgeted)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Spent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(analytics.summary.totalSpent)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🎯</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(analytics.summary.totalRemaining)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📈</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Budgets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.summary.activeBudgetCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Alerts */}
      {(overBudgetCount > 0 || nearLimitCount > 0) && (
        <div className="space-y-2">
          {overBudgetCount > 0 && (
            <Alert
              type="error"
              message={`${overBudgetCount} budget${
                overBudgetCount > 1 ? "s are" : " is"
              } over the limit!`}
            />
          )}
          {nearLimitCount > 0 && (
            <Alert
              type="warning"
              message={`${nearLimitCount} budget${
                nearLimitCount > 1 ? "s are" : " is"
              } approaching the limit.`}
            />
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === "all"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Budgets ({budgets.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === "active"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Active ({activeBudgets.length})
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === "inactive"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inactive ({budgets.length - activeBudgets.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Budget List */}
      {filteredBudgets.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === "all" ? "No budgets yet" : `No ${filter} budgets`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === "all"
              ? "Create your first budget to start tracking your spending limits."
              : `You don't have any ${filter} budgets at the moment.`}
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Budget Tips */}
      {budgets.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Budget Tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Review your budgets weekly to stay on track</li>
                  <li>
                    Adjust alert thresholds based on your spending patterns
                  </li>
                  <li>Set realistic budgets based on your average spending</li>
                  <li>
                    Create separate budgets for different time periods to
                    compare
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBudget(null);
        }}
        onBudgetAdded={handleBudgetAdded}
        editBudget={editingBudget}
      />
    </div>
  );
};

export default Budgets;
