import React from "react";

const Alert = ({ type = "info", message, onClose, className = "" }) => {
  const baseClasses = "p-4 rounded-lg flex items-center justify-between mb-4";

  const typeClasses = {
    success: "bg-green-50 text-green-800 border border-green-200",
    error: "bg-red-50 text-red-800 border border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    info: "bg-blue-50 text-blue-800 border border-blue-200",
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
        <span className="font-bold mr-2">{iconClasses[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 ml-4"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
