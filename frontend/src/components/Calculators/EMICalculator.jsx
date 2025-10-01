import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState("1000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanTenure, setLoanTenure] = useState("20");
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure]);

  const calculateEMI = () => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12; // Monthly interest rate
    const n = (parseFloat(loanTenure) || 0) * 12; // Total months

    if (P <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    // EMI Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setResult({
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principalAmount: Math.round(P),
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
        { name: "Principal", value: result.principalAmount },
        { name: "Interest", value: result.totalInterest },
      ]
    : [];

  const yearlyBreakdown = () => {
    if (!result) return [];

    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const emi = result.emi;
    let balance = P;
    const data = [];

    for (let year = 1; year <= Math.min(10, parseFloat(loanTenure)); year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) break;

        const interest = balance * r;
        const principal = emi - interest;

        yearlyPrincipal += principal;
        yearlyInterest += interest;
        balance -= principal;
      }

      data.push({
        year: `Year ${year}`,
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
      });

      if (balance <= 0) break;
    }

    return data;
  };

  const COLORS = ["#3b82f6", "#ef4444"];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">EMI Calculator</h2>
      <p className="text-gray-600 mb-6">
        Calculate your Equated Monthly Installment (EMI) for home loans, car
        loans, and personal loans
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <input
              type="text"
              value={loanAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setLoanAmount(value);
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
              value={loanAmount || 0}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹1L</span>
              <span>₹1Cr</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (% per annum)
            </label>
            <input
              type="text"
              value={interestRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setInterestRate(value);
                }
              }}
              className="input-field"
              placeholder="8.5"
            />
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate || 0}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Tenure (Years)
            </label>
            <input
              type="text"
              value={loanTenure}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setLoanTenure(value);
                }
              }}
              className="input-field"
              placeholder="20"
            />
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={loanTenure || 0}
              onChange={(e) => setLoanTenure(e.target.value)}
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
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Loan Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly EMI</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(result.emi)}
                    </span>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {formatCurrency(result.principalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-gray-900 font-semibold">
                        Total Payment
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(result.totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Payment Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-green-600 text-lg">💡</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-900">
                      Key Insights
                    </h4>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        • You'll pay {formatCurrency(result.emi)} every month
                        for {loanTenure} years
                      </p>
                      <p className="mt-1">
                        • Total interest: {formatCurrency(result.totalInterest)}{" "}
                        (
                        {(
                          (result.totalInterest / result.principalAmount) *
                          100
                        ).toFixed(1)}
                        % of loan)
                      </p>
                      <p className="mt-1">
                        • Total repayment: {formatCurrency(result.totalPayment)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Yearly Breakdown */}
      {result && yearlyBreakdown().length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Yearly Payment Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyBreakdown()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="principal" fill="#3b82f6" name="Principal" />
              <Bar dataKey="interest" fill="#ef4444" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
