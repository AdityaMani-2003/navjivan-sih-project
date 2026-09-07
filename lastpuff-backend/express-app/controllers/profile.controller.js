import User from "../models/User.js";
import SmokingProfile from "../models/SmokingProfile.js";
import FitnessProfile from "../models/FitnessProfile.js";
import Plan from "../models/Plan.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash").lean();
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const [smokerProfile, fitnessProfile, activePlan] = await Promise.all([
      user.userType === "smoker" ? SmokingProfile.findOne({ userId: user._id }).lean() : null,
      user.userType === "non-smoker" ? FitnessProfile.findOne({ userId: user._id }).lean() : null,
      Plan.findOne({ userId: user._id, status: "active" }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        smokerProfile,
        fitnessProfile,
        activePlan,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "age",
      "gender",
      "heightCm",
      "weightKg",
      "fcmToken",
      "expoPushToken",
      "emergencyContact",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-passwordHash");

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const setUserType = async (req, res, next) => {
  try {
    const { userType } = req.body;
    if (!["smoker", "non-smoker"].includes(userType)) {
      return res.status(400).json({
        success: false,
        error: "userType must be 'smoker' or 'non-smoker'",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { userType },
      { new: true }
    ).select("-passwordHash");

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export default {
  getProfile,
  updateProfile,
  setUserType,
};
