import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
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
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: function () {
        return this.isRecurring;
      },
    },
    receiptUrl: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
