import express from "express";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//@desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      limit = 50,
      page = 1,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const expenses = await Expense.find(filter)
      .sort(sortConfig)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);
    const totalPages = Math.ceil(totalExpenses / parseInt(limit));

    // Calculate summary
    const totalAmount = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalExpenses,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
        summary: {
          totalAmount: totalAmount[0]?.total || 0,
          count: expenses.length,
        },
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Get expense error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const {
      amount,
      category,
      description,
      date,
      isRecurring,
      recurringPeriod,
      tags,
    } = req.body;

    // Validation
    if (!amount || !category || !description) {
      return res.status(400).json({
        message: "Amount, category, and description are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Create expense
    const expense = await Expense.create({
      user: req.user._id,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring || false,
      recurringPeriod: isRecurring ? recurringPeriod : undefined,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: "Expense created successfully",
    });
  } catch (error) {
    console.error("Create expense error:", error.message);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      amount,
      category,
      description,
      date,
      isRecurring,
      recurringPeriod,
      tags,
    } = req.body;

    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update fields
    if (amount !== undefined) {
      if (amount <= 0) {
        return res
          .status(400)
          .json({ message: "Amount must be greater than 0" });
      }
      expense.amount = parseFloat(amount);
    }
    if (category) expense.category = category;
    if (description) expense.description = description.trim();
    if (date) expense.date = new Date(date);
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;
    if (recurringPeriod) expense.recurringPeriod = recurringPeriod;
    if (tags) expense.tags = tags;

    expense = await expense.save();

    res.json({
      success: true,
      data: expense,
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error("Update expense error:", error.message);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get expense analytics
// @route   GET /api/expenses/analytics
// @access  Private
router.get("/analytics/summary", auth, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get expenses for the period
    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: now },
    });

    // Calculate totals by category
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Calculate daily spending for the period
    const dailySpending = expenses.reduce((acc, expense) => {
      const dateKey = expense.date.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + expense.amount;
      return acc;
    }, {});

    // Calculate total and average
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const averagePerDay =
      totalAmount /
      Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      data: {
        period,
        totalAmount,
        averagePerDay,
        transactionCount: expenses.length,
        categoryBreakdown: categoryTotals,
        dailySpending,
        startDate,
        endDate: now,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get available categories
// @route   GET /api/expenses/categories
// @access  Private
router.get("/categories/list", auth, async (req, res) => {
  try {
    const categories = [
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
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
