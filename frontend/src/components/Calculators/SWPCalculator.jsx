// frontend/src/components/Calculators/SWPCalculator.js
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SWPCalculator = () => {
  const [totalInvestment, setTotalInvestment] = useState("1000000");
  const [withdrawalPerMonth, setWithdrawalPerMonth] = useState("10000");
  const [expectedReturn, setExpectedReturn] = useState("12");
  const [timePeriod, setTimePeriod] = useState("15");
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateSWP();
  }, [totalInvestment, withdrawalPerMonth, expectedReturn, timePeriod]);

  const calculateSWP = () => {
    const P = parseFloat(totalInvestment) || 0;
    const withdrawal = parseFloat(withdrawalPerMonth) || 0;
    const r = (parseFloat(expectedReturn) || 0) / 100 / 12; // Monthly rate
    const n = (parseFloat(timePeriod) || 0) * 12; // Total months

    if (P <= 0 || withdrawal <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    let balance = P;
    let totalWithdrawal = 0;
    const monthlyData = [];

    for (let month = 1; month <= n; month++) {
      if (balance <= 0) break;

      // Add returns for the month
      const returns = balance * r;
      balance += returns;

      // Withdraw
      const actualWithdrawal = Math.min(withdrawal, balance);
      balance -= actualWithdrawal;
      totalWithdrawal += actualWithdrawal;

      // Store data for every 6 months for chart
      if (month % 6 === 0 || month === n) {
        monthlyData.push({
          month: Math.round(month / 12),
          balance: Math.round(balance),
          withdrawn: Math.round(totalWithdrawal),
        });
      }
    }

    const finalValue = Math.max(0, Math.round(balance));
    const totalReturns = finalValue + totalWithdrawal - P;

    setResult({
      finalValue,
      totalWithdrawal: Math.round(totalWithdrawal),
      totalReturns: Math.round(totalReturns),
      monthlyData,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SWP Calculator</h2>
      <p className="text-gray-600 mb-6">
        Calculate Systematic Withdrawal Plan to understand how long your
        investments will last with regular withdrawals
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Investment
            </label>
            <input
              type="text"
              value={totalInvestment}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setTotalInvestment(value);
                }
              }}
              className="input-field"
              placeholder="1000000"
            />
            <input
              type="range"
              min="100000"
              max="10000000"
              step="50000"
              value={totalInvestment || 0}
              onChange={(e) => setTotalInvestment(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹1L</span>
              <span>₹1Cr</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Withdrawal
            </label>
            <input
              type="text"
              value={withdrawalPerMonth}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setWithdrawalPerMonth(value);
                }
              }}
              className="input-field"
              placeholder="10000"
            />
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={withdrawalPerMonth || 0}
              onChange={(e) => setWithdrawalPerMonth(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹1,000</span>
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
              max="25"
              step="0.5"
              value={expectedReturn || 0}
              onChange={(e) => setExpectedReturn(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>25%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Period (Years)
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
              placeholder="15"
            />
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={timePeriod || 0}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result && (
            <>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Withdrawal Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Initial Investment</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(parseFloat(totalInvestment))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Withdrawn</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(result.totalWithdrawal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Returns Generated</span>
                    <span className="text-lg font-semibold text-purple-600">
                      {formatCurrency(result.totalReturns)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        Final Value
                      </span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(result.finalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {result.finalValue === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-900">
                        Warning
                      </h4>
                      <p className="mt-1 text-sm text-red-700">
                        Your corpus will be exhausted before {timePeriod} years.
                        Consider reducing withdrawal amount or increasing
                        returns.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.finalValue > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-900">
                        Sustainable Withdrawal
                      </h4>
                      <p className="mt-1 text-sm text-green-700">
                        After {timePeriod} years of withdrawals, you'll still
                        have {formatCurrency(result.finalValue)} remaining.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
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
                        • Monthly withdrawal:{" "}
                        {formatCurrency(parseFloat(withdrawalPerMonth))}
                      </p>
                      <p className="mt-1">
                        • Total withdrawn over {timePeriod} years:{" "}
                        {formatCurrency(result.totalWithdrawal)}
                      </p>
                      <p className="mt-1">
                        • Your investment generated{" "}
                        {formatCurrency(result.totalReturns)} in returns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Balance Over Time Chart */}
      {result && result.monthlyData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Balance Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={result.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{ value: "Years", position: "insideBottom", offset: -5 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Remaining Balance"
              />
              <Line
                type="monotone"
                dataKey="withdrawn"
                stroke="#10b981"
                strokeWidth={2}
                name="Total Withdrawn"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SWPCalculator;
