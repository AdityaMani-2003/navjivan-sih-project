import User from "../models/User.js";
import SmokingProfile from "../models/SmokingProfile.js";
import FitnessProfile from "../models/FitnessProfile.js";
import Plan from "../models/Plan.js";
import Task from "../models/Task.js";
import {
  recommendSmokingPlan,
  recommendFitnessPlan,
} from "../services/recommendationEngine.js";

export const generateRecommendation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userType = user.userType || "smoker";
    let recommendationResult;

    if (userType === "smoker") {
      const profile = (await SmokingProfile.findOne({ userId })) || {
        frequencyPerDay: 10,
        timeToFirstUse: "6_to_30_min",
        nightUse: false,
        cravingIntensity: 3,
        cravingResistance: 3,
        motivationScore: 8,
        confidenceScore: 7,
        previousQuitAttempts: 1,
        longestSmokeFreePeriod: "1_to_7_days",
        relapseReasons: ["stress"],
        socialSupport: "yes",
        triggers: ["stress", "after_meals"],
        quitTimeline: "immediately",
      };

      recommendationResult = recommendSmokingPlan(profile);
    } else {
      const profile = (await FitnessProfile.findOne({ userId })) || {
        fitnessLevel: "beginner",
        activityFrequency: "1-2",
        activityDurationMinutes: 30,
        primaryGoal: "improve_fitness",
        availableExerciseMinutes: 30,
        hasSafetyRisk: false,
        bmi: 22,
        stressLevel: "moderate",
        sleepQuality: "good",
      };

      recommendationResult = recommendFitnessPlan(profile);
    }

    // Determine plan properties
    const planType =
      userType === "smoker"
        ? recommendationResult.plan
        : recommendationResult.level;

    const planName =
      userType === "smoker"
        ? planType === "cold_turkey"
          ? "Navjivan Cold Turkey Freedom Protocol"
          : "Navjivan Gradual Reduction Journey"
        : planType === "advanced"
        ? "Navjivan Athletic Conditioning"
        : planType === "intermediate"
        ? "Navjivan Core Fitness Progression"
        : "Navjivan Foundational Wellness Path";

    // Deactivate previous active plans
    await Plan.updateMany({ userId, status: "active" }, { status: "abandoned" });

    // Build weekly tasks template
    const weeklyStructure = [
      {
        week: 1,
        theme:
          userType === "smoker"
            ? "Breaking the Physical Loop"
            : "Building Consistent Habit Rhythms",
        focus:
          userType === "smoker"
            ? "Immediate craving substitution & hydration"
            : "Baseline cardio and mobility stretches",
        tasks: [
          {
            title:
              userType === "smoker"
                ? "Morning 4-7-8 Breathing (5 min)"
                : "Morning Joint Mobility (10 min)",
            category: userType === "smoker" ? "mindfulness" : "fitness",
            duration: userType === "smoker" ? 5 : 10,
            xpReward: 25,
          },
          {
            title:
              userType === "smoker"
                ? "Drink 2 glasses of fresh water on waking"
                : "Log 2 Litres of daily water intake",
            category: "nutrition",
            duration: 2,
            xpReward: 15,
          },
          {
            title:
              userType === "smoker"
                ? "Log your first craving in SOS room"
                : "Walk 4,000 steps today",
            category: userType === "smoker" ? "cessation" : "fitness",
            duration: 15,
            xpReward: 30,
          },
        ],
      },
    ];

    // Create the active Plan document in MongoDB
    const plan = await Plan.create({
      userId,
      planType,
      userType,
      status: "active",
      startDate: new Date(),
      durationDays: 30,
      planName,
      planDescription: recommendationResult.explanation,
      goals: [
        {
          id: "g1",
          title: userType === "smoker" ? "Achieve 24 Hours Smoke-Free" : "Complete 3 Workouts in Week 1",
          type: "milestone",
          deadline: 7,
        },
        {
          id: "g2",
          title: userType === "smoker" ? "Complete 7 Days Consecutive Clean" : "Achieve 35,000 Total Steps",
          type: "milestone",
          deadline: 14,
        },
      ],
      weeklyStructure,
      recommendationReasonCodes: recommendationResult.reasonCodes || [],
      recommendationExplanation: recommendationResult.explanation,
    });

    // Seed today's tasks in Task model
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Task.deleteMany({ userId, date: today });

    const tasksToInsert = weeklyStructure[0].tasks.map((t) => ({
      userId,
      planId: plan._id,
      date: today,
      title: t.title,
      description: `Recommended for ${planName}`,
      category: t.category,
      duration: t.duration,
      xpReward: t.xpReward,
      status: "pending",
    }));

    await Task.insertMany(tasksToInsert);

    res.json({
      success: true,
      data: {
        plan,
        planType,
        planName,
        reasonCodes: recommendationResult.reasonCodes,
        explanation: recommendationResult.explanation,
        scores: recommendationResult.scores,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentRecommendation = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ userId: req.user._id, status: "active" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  generateRecommendation,
  getCurrentRecommendation,
};
