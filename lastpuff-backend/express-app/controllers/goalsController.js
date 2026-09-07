import Goal from "../models/Goal.js";

// POST /api/goals/create
export const createGoal = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { title, description, targetValue, unit, dueDate, category, aiSuggested } = req.body;

    if (!title || !targetValue) {
      return res.status(400).json({ success: false, message: "title and targetValue are required" });
    }

    const goal = await Goal.create({
      userId,
      title,
      description: description || "",
      targetValue,
      unit: unit || "",
      dueDate: dueDate || null,
      category: category || "custom",
      aiSuggested: aiSuggested || false,
    });

    return res.status(201).json({ success: true, goal });
  } catch (err) {
    console.error("Create goal error:", err);
    return res.status(500).json({ success: false, message: "Server error creating goal" });
  }
};

// GET /api/goals/mine?status=active
export const getMyGoals = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const status = req.query.status; // "active", "completed", "abandoned" or undefined for all

    const filter = { userId };
    if (status) filter.status = status;

    const goals = await Goal.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, goals });
  } catch (err) {
    console.error("Get goals error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    const { currentValue, status, title, targetValue, dueDate, aiCommentary } = req.body;

    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (status !== undefined) goal.status = status;
    if (title !== undefined) goal.title = title;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (dueDate !== undefined) goal.dueDate = dueDate;
    if (aiCommentary !== undefined) goal.aiCommentary = aiCommentary;

    // Auto-complete if currentValue >= targetValue
    if (goal.currentValue >= goal.targetValue && goal.status === "active") {
      goal.status = "completed";
    }

    await goal.save();
    return res.status(200).json({ success: true, goal });
  } catch (err) {
    console.error("Update goal error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/goals/agent (Agentic AI Goal Synthesizer)
export const runGoalsAgent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await import("../models/User.js").then(m => m.default.findById(userId));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isNonSmoker = user.userType === "non-smoker";
    const { generateJSON } = await import("../services/aiService.js");

    const prompt = isNonSmoker
      ? `You are an autonomous AI athletic coach for an athlete focusing on ${user.fitnessProfile?.sport || "Fitness"} with goal ${user.fitnessProfile?.goal || "Wellness"}.
Generate 3 actionable daily goals for today.
Return JSON: {
  "analysis": "2 sentence coaching evaluation of athlete progress",
  "goals": [
    { "title": "...", "description": "...", "targetValue": N, "unit": "steps|mins|reps|g", "category": "Fitness|Nutrition|Mindset" }
  ]
}`
      : `You are an autonomous smoking cessation coach for a user on day ${user.streak || 0} of quitting. Cigs/day: ${user.smokerProfile?.cigarettesPerDay || 10}.
Generate 3 actionable daily recovery goals for today.
Return JSON: {
  "analysis": "2 sentence encouraging evaluation of recovery status",
  "goals": [
    { "title": "...", "description": "...", "targetValue": N, "unit": "cigs|mins|glasses|steps", "category": "Recovery|Health|Mindset" }
  ]
}`;

    const fallback = isNonSmoker
      ? {
          analysis: "Your consistency is building exceptional athletic momentum. Focus on explosive power and clean recovery today!",
          goals: [
            { title: "Complete 25-Min Agility & Core Split", description: "High-intensity sport conditioning", targetValue: 25, unit: "mins", category: "Fitness" },
            { title: "Walk 7,500 Steps on Heritage Trail", description: "Active recovery and endurance builder", targetValue: 7500, unit: "steps", category: "Fitness" },
            { title: "Log 65g Clean Protein & 3L Water", description: "Optimal muscle protein synthesis", targetValue: 3, unit: "L", category: "Nutrition" },
          ],
        }
      : {
          analysis: "Your lung capacity and blood oxygenation are actively recovering. Every craving you defeat builds mental armor!",
          goals: [
            { title: "Resist All Post-Meal Cravings", description: "Use 4-7-8 breathing when urge strikes", targetValue: 3, unit: "cravings", category: "Recovery" },
            { title: "Avoid 8 Cigarettes (Save ₹160)", description: "Keep your daily stepdown streak intact", targetValue: 8, unit: "cigs", category: "Recovery" },
            { title: "Walk 5,000 Detox Steps", description: "Stimulate cilia regeneration and endorphins", targetValue: 5000, unit: "steps", category: "Health" },
          ],
        };

    const result = await generateJSON(prompt, { fallback });
    
    // Save AI generated goals to DB
    const createdGoals = [];
    if (result.goals && Array.isArray(result.goals)) {
      for (const g of result.goals) {
        const doc = await Goal.create({
          userId,
          title: g.title,
          description: g.description || "",
          targetValue: g.targetValue || 1,
          currentValue: 0,
          unit: g.unit || "",
          category: g.category || "General",
          aiSuggested: true,
          aiCommentary: result.analysis,
        });
        createdGoals.push(doc);
      }
    }

    return res.status(200).json({
      success: true,
      analysis: result.analysis,
      goals: createdGoals.length > 0 ? createdGoals : result.goals,
    });
  } catch (err) {
    console.error("Run goals agent error:", err);
    return res.status(500).json({ success: false, message: "Server error running goals agent" });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { id } = req.params;

    const result = await Goal.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    return res.status(200).json({ success: true, message: "Goal deleted" });
  } catch (err) {
    console.error("Delete goal error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
