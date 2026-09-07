import Plan from "../models/Plan.js";
import User from "../models/User.js";

export const getCurrentPlan = async (req, res, next) => {
  try {
    let plan = await Plan.findOne({ userId: req.user._id, status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    if (!plan) {
      // Fallback: search for any plan
      plan = await Plan.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planType, planName } = req.body;

    const plan = await Plan.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { planType, planName, version: 2 } },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

export const getPlanHistory = async (req, res, next) => {
  try {
    const plans = await Plan.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

export default {
  getCurrentPlan,
  updatePlan,
  getPlanHistory,
};
