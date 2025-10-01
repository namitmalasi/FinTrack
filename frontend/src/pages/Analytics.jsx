import React, { useEffect, useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("category"); // category, trend, budget

  const {
    analytics: expenseAnalytics,
    loading: expenseLoading,
    error: expenseError,
    getAnalytics: getExpenseAnalytics,
    clearError: clearExpenseError,
  } = useExpenses();

  useEffect(() => {
    getExpenseAnalytics(period);
  }, [period, getExpenseAnalytics]);

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

  // Prepare data for Category Pie Chart
  const getCategoryData = () => {
    if (!expenseAnalytics?.categoryBreakdown) return [];

    return Object.entries(expenseAnalytics.categoryBreakdown)
      .map(([name, value]) => ({
        name,
        value,
        percentage:
          expenseAnalytics.totalAmount > 0
            ? ((value / expenseAnalytics.totalAmount) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Prepare data for Daily Spending Line Chart
  const getDailySpendingData = () => {
    if (!expenseAnalytics?.dailySpending) return [];

    return Object.entries(expenseAnalytics.dailySpending)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        amount: amount,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  };

  // Colors for charts
  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !expenseAnalytics) {
    return <LoadingSpinner />;
  }

  const categoryData = getCategoryData();
  const dailySpendingData = getDailySpendingData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Reports
          </h1>
          <p className="mt-2 text-gray-600">
            Visualize your spending patterns and financial insights
          </p>
        </div>

        {/* Period Selector */}
        <div className="mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input-field"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Summary Cards */}
      {expenseAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-sm font-medium text-gray-500">Total Spent</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(expenseAnalytics.totalAmount)}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {expenseAnalytics.transactionCount} transactions
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-medium text-gray-500">
              Daily Average
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {formatCurrency(expenseAnalytics.averagePerDay)}
            </div>
            <div className="mt-1 text-xs text-gray-500">per day</div>
          </div>

          <div className="card">
            <div className="text-sm font-medium text-gray-500">
              Highest Category
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {categoryData.length > 0
                ? formatCurrency(categoryData[0].value)
                : "$0.00"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {categoryData.length > 0 ? categoryData[0].name : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Chart Type Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setChartType("category")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                chartType === "category"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Category Breakdown
            </button>
            <button
              onClick={() => setChartType("trend")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                chartType === "trend"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Spending Trends
            </button>
          </nav>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        {chartType === "category" && categoryData.length > 0 && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Details
              </h3>
              <div className="space-y-3">
                {categoryData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.value)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Daily Spending Line Chart */}
        {chartType === "trend" && dailySpendingData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailySpendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Amount Spent"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* No Data Message */}
        {(chartType === "category" && categoryData.length === 0) ||
          (chartType === "trend" && dailySpendingData.length === 0 && (
            <div className="card lg:col-span-2 text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Data Available
              </h3>
            </div>
          ))}
      </div>

      {/* Insights Section */}
      {expenseAnalytics && categoryData.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                Financial Insights
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Your top spending category is{" "}
                    <strong>{categoryData[0].name}</strong> at{" "}
                    {formatCurrency(categoryData[0].value)} (
                    {categoryData[0].percentage}% of total)
                  </li>
                  <li>
                    Average daily spending is{" "}
                    {formatCurrency(expenseAnalytics.averagePerDay)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
