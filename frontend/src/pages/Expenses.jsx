/* eslint-disable react-hooks/exhaustive-deps */
// frontend/src/pages/Expenses.js
import { useEffect, useState } from "react";
import { useExpenses } from "../context/ExpenseContext.jsx";
import ExpenseList from "../components/Expenses/ExpenseList";
import ExpenseFilters from "../components/Expenses/ExpenseFilters";
import AddExpenseModal from "../components/Expenses/AddExpenseModal";
import Pagination from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";

const Expenses = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortOrder: "desc",
    limit: "20",
    page: 1,
  });

  const {
    expenses,
    categories,
    pagination,
    summary,
    loading,
    error,
    getExpenses,
    getCategories,
    deleteExpense,
    clearError,
  } = useExpenses();

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getExpenses(filters);
  }, [filters]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortOrder: "desc",
      limit: "20",
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExpenseAdded = () => {
    setShowAddModal(false);
    getExpenses(filters);
  };

  const handleExpenseEdit = () => {
    getExpenses(filters);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        // The expense list will be updated automatically via context
      } catch (error) {
        console.error("Failed to delete expense:", error.message);
      }
    }
  };

  const getDateRangeText = () => {
    if (filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(
        filters.endDate
      ).toLocaleDateString()}`;
    } else if (filters.startDate) {
      return `From ${new Date(filters.startDate).toLocaleDateString()}`;
    } else if (filters.endDate) {
      return `Until ${new Date(filters.endDate).toLocaleDateString()}`;
    }
    return "All time";
  };

  if (loading && !expenses.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-2 text-gray-600">Track and manage your expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          Add Expense
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    Total Amount
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(summary.totalAmount)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination ? pagination.totalExpenses : summary.count}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Period
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getDateRangeText()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Active Filters Display */}
      {(filters.category || filters.startDate || filters.endDate) && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                Active filters:
              </span>
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {filters.category}
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  From: {new Date(filters.startDate).toLocaleDateString()}
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Until: {new Date(filters.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-blue-700 hover:text-blue-900 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {expenses.length > 0 ? (
              <>
                Expense List (
                {pagination ? pagination.totalExpenses : expenses.length})
              </>
            ) : (
              "No Expenses Found"
            )}
          </h2>
          {pagination && pagination.totalPages > 1 && (
            <span className="text-sm text-gray-500">
              Showing{" "}
              {(pagination.currentPage - 1) * parseInt(filters.limit) + 1} -{" "}
              {Math.min(
                pagination.currentPage * parseInt(filters.limit),
                pagination.totalExpenses
              )}{" "}
              of {pagination.totalExpenses}
            </span>
          )}
        </div>

        <ExpenseList
          expenses={expenses}
          onEdit={handleExpenseEdit}
          onDelete={handleDeleteExpense}
          loading={loading}
        />

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
};

export default Expenses;
