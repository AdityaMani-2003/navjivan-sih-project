import QuestionnaireResponse from "../models/QuestionnaireResponse.js";
import SmokingProfile from "../models/SmokingProfile.js";
import FitnessProfile from "../models/FitnessProfile.js";
import User from "../models/User.js";

export const submitQuestionnaire = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { userType, rawAnswers } = req.body;

    if (!userType || !rawAnswers) {
      return res.status(400).json({
        success: false,
        error: "userType and rawAnswers are required",
      });
    }

    // 1. Save questionnaire response history
    const responseDoc = await QuestionnaireResponse.create({
      userId,
      userType,
      rawAnswers,
      completedAt: new Date(),
    });

    // 2. Ensure User userType is updated
    await User.findByIdAndUpdate(userId, { userType });

    // 3. Upsert specific profile based on userType
    if (userType === "smoker") {
      const smokingData = {
        userId,
        tobaccoProduct: Array.isArray(rawAnswers.tobaccoProduct)
          ? rawAnswers.tobaccoProduct
          : [rawAnswers.tobaccoProduct || "cigarettes"],
        durationOfUse: rawAnswers.durationOfUse || "1_to_3_yrs",
        frequencyPerDay: Number(rawAnswers.frequencyPerDay || 10),
        timeToFirstUse: rawAnswers.timeToFirstUse || "6_to_30_min",
        nightUse: Boolean(rawAnswers.nightUse),
        dailySpend: Number(rawAnswers.dailySpend || 150),
        cravingFrequency: rawAnswers.cravingFrequency || "several_times_day",
        cravingIntensity: Number(rawAnswers.cravingIntensity || 3),
        cravingResistance: Number(rawAnswers.cravingResistance || 3),
        triggers: Array.isArray(rawAnswers.triggers) ? rawAnswers.triggers : ["stress"],
        previousQuitAttempts: Number(rawAnswers.previousQuitAttempts || 0),
        previousQuitMethods: Array.isArray(rawAnswers.previousQuitMethods)
          ? rawAnswers.previousQuitMethods
          : [],
        longestSmokeFreePeriod: rawAnswers.longestSmokeFreePeriod || "less_than_1_day",
        relapseReasons: Array.isArray(rawAnswers.relapseReasons)
          ? rawAnswers.relapseReasons
          : [],
        motivationScore: Number(rawAnswers.motivationScore || 7),
        confidenceScore: Number(rawAnswers.confidenceScore || 6),
        importanceScore: Number(rawAnswers.importanceScore || 8),
        quitTimeline: rawAnswers.quitTimeline || "within_1_week",
        socialSupport: rawAnswers.socialSupport || "yes",
      };

      await SmokingProfile.findOneAndUpdate({ userId }, smokingData, {
        upsert: true,
        new: true,
      });
    } else {
      const fitnessData = {
        userId,
        primaryGoal: rawAnswers.primaryGoal || "improve_fitness",
        fitnessLevel: rawAnswers.fitnessLevel || "beginner",
        activityFrequency: rawAnswers.activityFrequency || "1-2",
        activityDuration: rawAnswers.activityDuration || "15-30",
        currentActivities: Array.isArray(rawAnswers.currentActivities)
          ? rawAnswers.currentActivities
          : [],
        preferredActivities: Array.isArray(rawAnswers.preferredActivities)
          ? rawAnswers.preferredActivities
          : [],
        exerciseLocation: rawAnswers.exerciseLocation || "home",
        socialPreference: rawAnswers.socialPreference || "alone",
        motivation: Array.isArray(rawAnswers.motivation) ? rawAnswers.motivation : [],
        dietType: rawAnswers.dietType || "vegetarian",
        mealsPerDay: Number(rawAnswers.mealsPerDay || 3),
        fastFoodFrequency: rawAnswers.fastFoodFrequency || "rarely",
        waterIntakeLitres: Number(rawAnswers.waterIntakeLitres || 2),
        nutritionGoal: rawAnswers.nutritionGoal || "healthy_eating",
        sleepHours: Number(rawAnswers.sleepHours || 7),
        sleepQuality: rawAnswers.sleepQuality || "good",
        stressLevel: rawAnswers.stressLevel || "moderate",
        sedentaryHours: rawAnswers.sedentaryHours || "4-6h",
        availableExerciseMinutes: Number(rawAnswers.availableExerciseMinutes || 30),
        safetyFlags: Array.isArray(rawAnswers.safetyFlags) ? rawAnswers.safetyFlags : [],
        hasSafetyRisk: Boolean(rawAnswers.hasSafetyRisk),
      };

      await FitnessProfile.findOneAndUpdate({ userId }, fitnessData, {
        upsert: true,
        new: true,
      });
    }

    res.json({
      success: true,
      data: {
        responseId: responseDoc._id,
        userType,
        message: "Questionnaire submitted successfully",
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getQuestionnaire = async (req, res, next) => {
  try {
    const latest = await QuestionnaireResponse.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: latest,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  submitQuestionnaire,
  getQuestionnaire,
};
