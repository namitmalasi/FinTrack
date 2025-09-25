import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount cannot be negative"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Emergency Fund",
        "Vacation",
        "Car Purchase",
        "Home Down Payment",
        "Education",
        "Retirement",
        "Wedding",
        "Debt Payoff",
        "Investment",
        "Other",
      ],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
goalSchema.index({ user: 1, isCompleted: 1 });
goalSchema.index({ user: 1, deadline: 1 });

// Calculate progress percentage
goalSchema.virtual("progressPercentage").get(function () {
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Mark as completed when target is reached
goalSchema.pre("save", function (next) {
  if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  } else if (this.currentAmount < this.targetAmount && this.isCompleted) {
    this.isCompleted = false;
    this.completedAt = undefined;
  }
  next();
});
const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
