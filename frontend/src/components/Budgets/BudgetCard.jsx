const BudgetCard = ({ budget, onEdit, onDelete, onToggleStatus }) => {
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

  const getProgressBarColor = (percentage, isOverBudget) => {
    if (isOverBudget) return "bg-red-500";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPercentageColor = (percentage, isOverBudget) => {
    if (isOverBudget) return "text-red-600";
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getRemainingDays = () => {
    const today = new Date();
    const endDate = new Date(budget.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const remainingDays = getRemainingDays();
  const progressPercentage = Math.min(budget.percentageUsed, 100);

  return (
    <div
      className={`card ${
        !budget.isActive ? "opacity-60" : ""
      } hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {budget.category}
            </h3>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                budget.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {budget.isActive ? "Active" : "Inactive"}
            </span>
            {budget.isOverBudget && (
              <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Over Budget
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 capitalize">
            {budget.period} budget
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(budget)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit budget"
          >
            ✏️
          </button>
          <button
            onClick={() => onToggleStatus(budget._id, !budget.isActive)}
            className="text-gray-600 hover:text-gray-800 text-sm"
            title={budget.isActive ? "Deactivate budget" : "Activate budget"}
          >
            {budget.isActive ? "⏸️" : "▶️"}
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Delete budget"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {formatCurrency(budget.actualSpent)} /{" "}
            {formatCurrency(budget.budgetAmount)}
          </span>
          <span
            className={`text-sm font-medium ${getPercentageColor(
              budget.percentageUsed,
              budget.isOverBudget
            )}`}
          >
            {budget.percentageUsed.toFixed(1)}% used
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(
              budget.percentageUsed,
              budget.isOverBudget
            )}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span>
            {budget.remainingAmount >= 0
              ? `${formatCurrency(budget.remainingAmount)} remaining`
              : `${formatCurrency(
                  Math.abs(budget.remainingAmount)
                )} over budget`}
          </span>
          <span>
            {remainingDays > 0
              ? `${remainingDays} days left`
              : remainingDays === 0
              ? "Ends today"
              : "Expired"}
          </span>
        </div>
      </div>

      {/* Budget Details */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Start Date:</span>
            <p className="font-medium">{formatDate(budget.startDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">End Date:</span>
            <p className="font-medium">{formatDate(budget.endDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">Expenses:</span>
            <p className="font-medium">
              {budget.expenseCount || 0} transactions
            </p>
          </div>
          <div>
            <span className="text-gray-500">Alert at:</span>
            <p className="font-medium">{budget.alertThreshold}%</p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {budget.needsAlert && budget.isActive && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You've reached {budget.percentageUsed.toFixed(1)}% of your
                budget limit.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
