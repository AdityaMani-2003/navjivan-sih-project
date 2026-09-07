import FitSquad from "../models/FitSquad.js";
import User from "../models/User.js";

export const getPublicSquads = async (req, res, next) => {
  try {
    const squads = await FitSquad.find({ isPublic: true })
      .populate("createdBy", "name level userType")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: squads });
  } catch (err) {
    next(err);
  }
};

export const createSquad = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, goalTitle, targetDays = 14, maxMembers = 20 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Squad name is required" });
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(targetDays));

    const squad = await FitSquad.create({
      name: name.trim(),
      description: description || "Together we conquer cravings and build strength.",
      createdBy: userId,
      maxMembers: Number(maxMembers),
      members: [
        {
          userId,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
      goals: [
        {
          title: goalTitle || "7-Day Consistent Streak",
          targetDate,
          completionRate: 0,
        },
      ],
    });

    res.status(201).json({ success: true, data: squad });
  } catch (err) {
    next(err);
  }
};

export const joinSquad = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const squad = await FitSquad.findById(id);
    if (!squad) {
      return res.status(404).json({ success: false, error: "Squad not found" });
    }

    const alreadyJoined = squad.members.some((m) => m.userId.toString() === userId.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, error: "Already a member of this squad" });
    }

    if (squad.members.length >= squad.maxMembers) {
      return res.status(400).json({ success: false, error: "This squad is currently full" });
    }

    squad.members.push({
      userId,
      role: "member",
      joinedAt: new Date(),
    });

    await squad.save();
    res.json({ success: true, data: squad, message: "Joined squad successfully" });
  } catch (err) {
    next(err);
  }
};

export const getSquadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const squad = await FitSquad.findById(id)
      .populate("members.userId", "name level userType xp streak")
      .populate("createdBy", "name level")
      .lean();

    if (!squad) {
      return res.status(404).json({ success: false, error: "Squad not found" });
    }

    res.json({ success: true, data: squad });
  } catch (err) {
    next(err);
  }
};

export default {
  getPublicSquads,
  createSquad,
  joinSquad,
  getSquadById,
};
