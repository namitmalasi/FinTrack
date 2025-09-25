import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food & Dining",
        "Transportation",
        "Entertainment",
        "Shopping",
        "Bills & Utilities",
        "Healthcare",
        "Education",
        "Travel",
        "Home & Garden",
        "Personal Care",
        "Gifts & Donations",
        "Investment",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0, "Budget amount cannot be negative"],
    },
    period: {
      type: String,
      required: [true, "Budget period is required"],
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"],
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is spent
      min: [0, "Alert threshold cannot be negative"],
      max: [100, "Alert threshold cannot exceed 100%"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, isActive: 1 });

// Validate that endDate is after startDate
budgetSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
