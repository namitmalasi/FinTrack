import React, { useState } from "react";
import SIPCalculator from "../components/Calculators/SIPCalculator";
import EMICalculator from "../components/Calculators/EMICalculator";
import SWPCalculator from "../components/Calculators/SWPCalculator";

const Calculators = () => {
  const [activeCalculator, setActiveCalculator] = useState("sip");

  const calculators = [
    {
      id: "sip",
      name: "SIP Calculator",
      icon: "📈",
      description: "Systematic Investment Plan",
    },
    {
      id: "emi",
      name: "EMI Calculator",
      icon: "🏦",
      description: "Equated Monthly Installment",
    },
    {
      id: "swp",
      name: "SWP Calculator",
      icon: "💰",
      description: "Systematic Withdrawal Plan",
    },
     ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Financial Calculators
        </h1>
        <p className="mt-2 text-gray-600">
          Plan your investments and loans with our financial calculators
        </p>
      </div>

      {/* Calculator Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalculator(calc.id)}
            className={`card text-left transition-all ${
              activeCalculator === calc.id
                ? "ring-2 ring-primary-500 bg-primary-50"
                : "hover:shadow-md"
            }`}
          >
            <div className="text-3xl mb-2">{calc.icon}</div>
            <h3 className="font-semibold text-gray-900">{calc.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{calc.description}</p>
          </button>
        ))}
      </div>

      {/* Active Calculator */}
      <div>
        {activeCalculator === "sip" && <SIPCalculator />}
        {activeCalculator === "emi" && <EMICalculator />}
        {activeCalculator === "swp" && <SWPCalculator />}
      </div>
    </div>
  );
};

export default Calculators;
