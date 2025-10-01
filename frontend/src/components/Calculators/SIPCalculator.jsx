import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState("5000");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [timePeriod, setTimePeriod] = useState("10");
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  const calculateSIP = () => {
    const P = parseFloat(monthlyInvestment) || 0;
    const r = (parseFloat(expectedReturn) || 0) / 100 / 12; // Monthly rate
    const n = (parseFloat(timePeriod) || 0) * 12; // Total months

    if (P <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    // SIP Future Value Formula: FV = P × ({[1 + r]^n – 1} / r) × (1 + r)
    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvestment = P * n;
    const estimatedReturns = futureValue - totalInvestment;

    setResult({
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(totalInvestment),
      estimatedReturns: Math.round(estimatedReturns),
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = result
    ? [
        { name: "Invested Amount", value: result.totalInvestment },
        { name: "Est. Returns", value: result.estimatedReturns },
      ]
    : [];

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SIP Calculator</h2>
      <p className="text-gray-600 mb-6">
        Calculate the future value of your Systematic Investment Plan (SIP)
        investments
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Investment
            </label>
            <input
              type="text"
              value={monthlyInvestment}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setMonthlyInvestment(value);
                }
              }}
              className="input-field"
              placeholder="5000"
            />
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment || 0}
              onChange={(e) => setMonthlyInvestment(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Return Rate (% per annum)
            </label>
            <input
              type="text"
              value={expectedReturn}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setExpectedReturn(value);
                }
              }}
              className="input-field"
              placeholder="12"
            />
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn || 0}
              onChange={(e) => setExpectedReturn(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period (Years)
            </label>
            <input
              type="text"
              value={timePeriod}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setTimePeriod(value);
                }
              }}
              className="input-field"
              placeholder="10"
            />
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod || 0}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Year</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result && (
            <>
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Investment Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Investment</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(result.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Returns</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(result.estimatedReturns)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        Future Value
                      </span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(result.futureValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Investment Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-lg">💡</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      Key Insights
                    </h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        • You'll invest {formatCurrency(result.totalInvestment)}{" "}
                        over {timePeriod} years
                      </p>
                      <p className="mt-1">
                        • Your wealth will grow to{" "}
                        {formatCurrency(result.futureValue)}
                      </p>
                      <p className="mt-1">
                        • Returns:{" "}
                        {(
                          (result.estimatedReturns / result.totalInvestment) *
                          100
                        ).toFixed(1)}
                        % of invested amount
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;
