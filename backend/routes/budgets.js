import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/ @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = { user: req.user._id };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const budgets = await Budget.find(filter).sort({ createdAt: -1 });

    // Calculate actual spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user._id,
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
          }
        });

        const actualSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingAmount = budget.amount - actualSpent;
        const percentageUsed = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

        return {
          ...budget.toObject(),
          actualSpent,
          remainingAmount,
          percentageUsed: Math.min(percentageUsed, 100),
          isOverBudget: actualSpent > budget.amount,
          expenseCount: expenses.length
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpending
    });
  } catch (error) {
    console.error('Get budgets error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Get related expenses
    const expenses = await Expense.find({
      user: req.user._id,
      category: budget.category,
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate
      }
    }).sort({ date: -1 });

    const actualSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingAmount = budget.amount - actualSpent;
    const percentageUsed = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        actualSpent,
        remainingAmount,
        percentageUsed: Math.min(percentageUsed, 100),
        isOverBudget: actualSpent > budget.amount,
        expenses
      }
    });
  } catch (error) {
    console.error('Get budget error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      category,
      amount,
      period,
      startDate,
      endDate,
      alertThreshold
    } = req.body;

    // Validation
    if (!category || !amount || !period || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Category, amount, period, start date, and end date are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: 'Budget amount must be greater than 0'
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category,
      isActive: true,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (existingBudget) {
      return res.status(400).json({
        message: `Active budget already exists for ${category} in this time period`
      });
    }

    // Create budget
    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount: parseFloat(amount),
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      alertThreshold: alertThreshold || 80
    });

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    console.error('Create budget error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      category,
      amount,
      period,
      startDate,
      endDate,
      alertThreshold,
      isActive
    } = req.body;

    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Update fields
    if (category) budget.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ message: 'Budget amount must be greater than 0' });
      }
      budget.amount = parseFloat(amount);
    }
    if (period) budget.period = period;
    if (startDate) budget.startDate = new Date(startDate);
    if (endDate) budget.endDate = new Date(endDate);
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
    if (isActive !== undefined) budget.isActive = isActive;

    // Validate dates
    if (budget.endDate <= budget.startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    budget = await budget.save();

    res.json({
      success: true,
      data: budget,
      message: 'Budget updated successfully'
    });
  } catch (error) {
    console.error('Update budget error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Get budget analytics
// @route   GET /api/budgets/analytics
// @access  Private
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const now = new Date();
    
    // Get active budgets
    const activeBudgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Calculate spending for each budget
    const budgetAnalytics = await Promise.all(
      activeBudgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user._id,
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate
          }
        });

        const actualSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const percentageUsed = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

        return {
          budgetId: budget._id,
          category: budget.category,
          budgetAmount: budget.amount,
          actualSpent,
          remainingAmount: budget.amount - actualSpent,
          percentageUsed: Math.min(percentageUsed, 100),
          isOverBudget: actualSpent > budget.amount,
          alertThreshold: budget.alertThreshold,
          needsAlert: percentageUsed >= budget.alertThreshold
        };
      })
    );

    // Calculate overall statistics
    const totalBudgeted = budgetAnalytics.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgetAnalytics.reduce((sum, b) => sum + b.actualSpent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overBudgetCount = budgetAnalytics.filter(b => b.isOverBudget).length;
    const alertsNeeded = budgetAnalytics.filter(b => b.needsAlert).length;

    res.json({
      success: true,
      data: {
        summary: {
          totalBudgeted,
          totalSpent,
          totalRemaining,
          overallPercentageUsed: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
          activeBudgetCount: activeBudgets.length,
          overBudgetCount,
          alertsNeeded
        },
        budgets: budgetAnalytics
      }
    });
  } catch (error) {
    console.error('Get budget analytics error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Check budget alerts
// @route   GET /api/budgets/alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const now = new Date();
    
    // Get active budgets
    const activeBudgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const alerts = [];

    for (const budget of activeBudgets) {
      const expenses = await Expense.find({
        user: req.user._id,
        category: budget.category,
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate
        }
      });

      const actualSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentageUsed = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

      if (actualSpent > budget.amount) {
        alerts.push({
          type: 'over_budget',
          severity: 'high',
          budgetId: budget._id,
          category: budget.category,
          message: `You've exceeded your ${budget.category} budget by $${(actualSpent - budget.amount).toFixed(2)}`,
          budgetAmount: budget.amount,
          actualSpent,
          overage: actualSpent - budget.amount
        });
      } else if (percentageUsed >= budget.alertThreshold) {
        alerts.push({
          type: 'approaching_limit',
          severity: 'medium',
          budgetId: budget._id,
          category: budget.category,
          message: `You've used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget`,
          budgetAmount: budget.amount,
          actualSpent,
          percentageUsed
        });
      }
    }

    res.json({
      success: true,
      data: {
        alerts,
        alertCount: alerts.length
      }
    });
  } catch (error) {
    console.error('Get budget alerts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;