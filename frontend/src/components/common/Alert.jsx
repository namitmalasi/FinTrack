const Alert = ({ type = "info", message, onClose, className = "" }) => {
  const baseClasses =
    "p-4 rounded-xl flex items-center justify-between mb-6 border-2";

  const typeClasses = {
    success: "bg-green-50 text-green-800 border-green-300",
    error: "bg-red-50 text-red-800 border-red-300",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-300",
    info: "bg-blue-50 text-blue-800 border-blue-300",
  };

  const iconClasses = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <div className="flex items-center">
        <span className="font-bold mr-3 text-lg">{iconClasses[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 ml-4 font-bold text-xl"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
