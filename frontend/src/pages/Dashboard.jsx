import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import AddExpenseModal from "../components/Expenses/AddExpenseModal";

const Dashboard = () => {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const {
    analytics: expenseAnalytics,
    loading: expenseLoading,
    error: expenseError,
    getAnalytics: getExpenseAnalytics,
    clearError: clearExpenseError,
  } = useExpenses();

  useEffect(() => {
    // Load dashboard data
    getExpenseAnalytics("month");
    // getAlerts();
  }, []);

  const loading = expenseLoading;
  const error = expenseError;

  const clearError = () => {
    clearExpenseError();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // const getPercentageColor = (percentage) => {
  //   if (percentage >= 90) return "text-red-600";
  //   if (percentage >= 70) return "text-yellow-600";
  //   return "text-green-600";
  // };

  // const getProgressBarColor = (percentage) => {
  //   if (percentage >= 90) return "bg-red-500";
  //   if (percentage >= 70) return "bg-yellow-500";
  //   return "bg-green-500";
  // };

  if (loading && !expenseAnalytics) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's your financial overview for this month.
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Budget Alerts */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Expenses This Month */}
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
                  This Month's Expenses
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {expenseAnalytics
                    ? formatCurrency(expenseAnalytics.totalAmount)
                    : "$0.00"}
                </dd>
                <dd className="text-xs text-gray-500">
                  {expenseAnalytics
                    ? `${expenseAnalytics.transactionCount} transactions`
                    : "0 transactions"}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📈</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Daily Average
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {expenseAnalytics
                    ? formatCurrency(expenseAnalytics.averagePerDay)
                    : "$0.00"}
                </dd>
                <dd className="text-xs text-gray-500">per day this month</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total Budget */}

        {/* Budget Remaining */}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="btn-primary"
          >
            Add Expense
          </button>
          <Link to="/analytics" className="btn-secondary text-center">
            View Analytics
          </Link>
          <Link to="/calculators" className="btn-secondary text-center">
            Financial Tools
          </Link>
        </div>
      </div>

      {/* Budget Overview */}

      {/* Category Breakdown */}
      {expenseAnalytics?.categoryBreakdown && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Top Spending Categories
            </h2>
            <Link
              to="/analytics"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details →
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(expenseAnalytics.categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => {
                const percentage =
                  expenseAnalytics.totalAmount > 0
                    ? (amount / expenseAnalytics.totalAmount) * 100
                    : 0;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {category}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% of total spending
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {(!expenseAnalytics || expenseAnalytics.transactionCount === 0) && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Get Started with Expense Tracking
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Start building better financial habits:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Add your first expense to begin tracking</li>
                  <li>Set up budgets for different categories</li>
                  <li>Monitor your spending patterns with analytics</li>
                </ul>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="btn-primary text-sm"
                >
                  Add Your First Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onExpenseAdded={() => {
          setShowAddExpenseModal(false);
          getExpenseAnalytics("month");
        }}
      />
    </div>
  );
};

export default Dashboard;
