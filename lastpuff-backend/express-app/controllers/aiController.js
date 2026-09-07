/**
 * AI Controller — All /api/ai/* endpoints
 * Every endpoint returns a sensible mock when API keys are missing.
 */

import User from "../models/User.js";
import ChatMessage from "../models/ChatMessage.js";
import { generateText, generateJSON, analyzeImage, checkRateLimit } from "../services/aiService.js";

// Helper to resolve real or demo user gracefully
async function resolveUser(req) {
  const userId = req.user?.id || req.user?._id;
  let user = null;
  try {
    if (userId && String(userId).length === 24) {
      user = await User.findById(userId);
    }
  } catch (_e) {}

  if (!user) {
    user = {
      _id: userId || "660000000000000000000001",
      name: req.user?.name || "Aditya (Pioneer)",
      userType: req.user?.userType || (req.body?.userType) || "smoker",
      streak: 4,
      xp: 520,
      level: 2,
      cigarettesPerDay: req.body?.cigarettesPerDay || 12,
      smokingYears: req.body?.smokingYears || 4,
      smokerProfile: {
        cigarettesPerDay: req.body?.cigarettesPerDay || 12,
        yearsSmoking: req.body?.smokingYears || 4,
        triggers: req.body?.triggers || ["Morning Chai ☕", "Work Stress 💻", "After Meals 🍽️"],
        quitStrategy: "gradual",
        costPerPack: 360,
      },
      fitnessProfile: {
        goal: req.body?.goal || "Endurance & Vitality",
        level: req.body?.level || "intermediate",
        sport: req.body?.sport || "Cricket",
        daysPerWeek: req.body?.daysPerWeek || 4,
      },
    };
  }
  return user;
}

// ─── POST /api/ai/quit-plan-suggest ────────────────────────
export const suggestQuitPlan = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;

    const { allowed, remaining } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded. Try again later." });

    const cigsPerDay = user.smokerProfile?.cigarettesPerDay || user.cigarettesPerDay || 10;
    const years = user.smokerProfile?.yearsSmoking || user.smokingYears || 1;
    const triggers = user.smokerProfile?.triggers?.join(", ") || "stress";
    const prevAttempts = user.smokerProfile?.previousAttempts || 0;

    const prompt = `You are an expert smoking cessation counselor. Based on this profile:
- Cigarettes per day: ${cigsPerDay}
- Years smoking: ${years}
- Main triggers: ${triggers}
- Previous quit attempts: ${prevAttempts}

Recommend either "Cold Turkey" or "Gradual Reduction" and explain why in 2 sentences.
Then generate a 7-day action plan with daily tips (one tip per day, 1-2 sentences each).

Return JSON: { "recommendation": "cold_turkey" | "gradual", "explanation": "...", "dailyPlan": [{"day": 1, "tip": "..."},...] }`;

    const fallback = {
      recommendation: cigsPerDay > 20 ? "gradual" : "cold_turkey",
      explanation: cigsPerDay > 20
        ? "With a higher consumption level, gradual reduction minimizes severe withdrawal symptoms and gives your body time to adjust."
        : "With moderate consumption, going cold turkey gives the fastest results and a clean mental break from the habit.",
      dailyPlan: [
        { day: 1, tip: "Remove all cigarettes, lighters, and ashtrays from your environment. Drink plenty of water." },
        { day: 2, tip: "When a craving hits, use the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s." },
        { day: 3, tip: "Keep your hands busy. Try stress balls, drawing, or cooking a new recipe." },
        { day: 4, tip: "Physical withdrawal peaks today. Go for a 20-minute walk to boost endorphins." },
        { day: 5, tip: "Reward yourself! You've saved money. Treat yourself to something you enjoy." },
        { day: 6, tip: "Identify your top trigger situation and create a specific alternative action plan." },
        { day: 7, tip: "You made it through the hardest week! Share your milestone with the community." },
      ],
    };

    const result = await generateJSON(prompt, {
      cacheKey: `quit_plan_${userId}`,
      fallback,
    });

    return res.status(200).json({ success: true, plan: result, remaining });
  } catch (err) {
    console.error("Quit plan suggest error:", err);
    return res.status(500).json({ success: false, message: "Server error generating quit plan" });
  }
};

// ─── POST /api/ai/disease-risk ─────────────────────────────
export const analyzeRisk = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;

    const { allowed } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded" });

    const years = user.smokerProfile?.yearsSmoking || user.smokingYears || 1;
    const cigsPerDay = user.smokerProfile?.cigarettesPerDay || user.cigarettesPerDay || 10;
    const age = user.age || 25;
    const { familyHistory } = req.body || {};

    const prompt = `Given this smoking history:
- Years smoked: ${years}
- Cigarettes/day: ${cigsPerDay}
- Age: ${age}
- Family history: ${familyHistory ? JSON.stringify(familyHistory) : "none specified"}

Calculate risk percentages for: COPD, Lung Cancer, Heart Disease, Stroke, Peripheral Vascular Disease.
Return JSON array: [{ "disease": "...", "risk_percentage": N, "severity": "low|medium|high|critical", "explanation": "2 sentences" }]`;

    const fallback = [
      { disease: "COPD", risk_percentage: Math.min(80, years * 3 + cigsPerDay), severity: years > 10 ? "high" : "medium", explanation: "Chronic smoking damages air sacs in the lungs. Early quitting can slow progression significantly." },
      { disease: "Lung Cancer", risk_percentage: Math.min(70, years * 2.5 + cigsPerDay * 0.8), severity: years > 15 ? "high" : "medium", explanation: "Smoking is the leading cause of lung cancer. Risk decreases steadily after quitting." },
      { disease: "Heart Disease", risk_percentage: Math.min(60, years * 2 + cigsPerDay * 0.5), severity: years > 10 ? "medium" : "low", explanation: "Smoking accelerates atherosclerosis. Heart attack risk drops 50% within one year of quitting." },
      { disease: "Stroke", risk_percentage: Math.min(50, years * 1.5 + cigsPerDay * 0.4), severity: "medium", explanation: "Smoking increases blood clot risk. Quitting reduces stroke risk to near non-smoker levels in 5 years." },
      { disease: "Peripheral Vascular Disease", risk_percentage: Math.min(45, years * 1.5 + cigsPerDay * 0.3), severity: "low", explanation: "Smoking restricts blood flow to extremities. Exercise and quitting are the best treatments." },
    ];

    const result = await generateJSON(prompt, {
      cacheKey: `disease_risk_${userId}`,
      fallback,
    });

    return res.status(200).json({
      success: true,
      risks: result,
      disclaimer: "For informational purposes only. Consult a doctor for medical advice.",
    });
  } catch (err) {
    console.error("Disease risk error:", err);
    return res.status(500).json({ success: false, message: "Server error analyzing risk" });
  }
};

// ─── POST /api/ai/chat ─────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;

    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required" });

    const { allowed } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded. Upgrade to Premium for unlimited chat." });

    // Save user message (safe try-catch)
    try {
      await ChatMessage.create({ userId, role: "user", content: message });
    } catch (_e) {}

    // Get recent chat history (last 10 messages)
    let contextMessages = "";
    try {
      const history = await ChatMessage.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      contextMessages = history.reverse().map((m) => `${m.role}: ${m.content}`).join("\n");
    } catch (_e) {}

    const isNonSmoker = user.userType === "non-smoker";
    const daysClean = user.streak || 0;
    const quitStrategy = user.smokerProfile?.quitStrategy || user.plan || "gradual";
    const triggers = user.smokerProfile?.triggers?.join(", ") || "stress";
    const sport = user.fitnessProfile?.sport || "General Fitness";
    const fitnessGoal = user.fitnessProfile?.goal || "Endurance & Wellness";

    let systemPrompt = "";
    if (isNonSmoker) {
      systemPrompt = `You are Navjivan, an elite AI sports performance & fitness coach. The user is focusing on ${sport} and their primary goal is ${fitnessGoal}.
Provide: 1) Actionable training & recovery advice 2) Nutrition/hydration tips for Indian diets 3) Mental toughness & focus coaching 4) Brief, punchy conversational replies (2-3 sentences max). Speak like a supportive, high-performance mentor. Use relevant emojis.

Recent conversation:
${contextMessages}

User: ${message}
Assistant:`;
    } else {
      systemPrompt = `You are Navjivan, a compassionate AI wellness coach specializing in smoking cessation. The user has been smoke-free for ${daysClean} days. Their quit strategy is ${quitStrategy}. Their main triggers are ${triggers}. Provide: 1) Empathetic responses 2) Science-backed coping strategies 3) Motivational support 4) Brief, conversational replies (2-3 sentences max). Never be preachy. Speak like a supportive friend. If user expresses severe distress, suggest the Quitline (1800-11-2356).

Recent conversation:
${contextMessages}

User: ${message}
Assistant:`;
    }

    const reply = await generateText(systemPrompt, {
      fallback: isNonSmoker
        ? "Fuel your engine with high-protein whole foods and stay consistent with your training splits! Focus on one rep, one step at a time. What workout are you tackling today? ⚡"
        : "Cravings peak and fade within 3 to 5 minutes. Take three deep diaphragmatic breaths right now. You've got the strength to outlast this urge! 💪",
    });

    // Save assistant response (safe try-catch)
    try {
      await ChatMessage.create({ userId, role: "assistant", content: reply });
    } catch (_e) {}

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ success: false, message: "Server error in chat" });
  }
};

// ─── POST /api/ai/fitness-plan ─────────────────────────────
export const generateFitnessPlan = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;

    const { allowed } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded" });

    const goal = user.fitnessProfile?.goal || req.body?.goal || "general_wellness";
    const level = user.fitnessProfile?.level || req.body?.level || "beginner";
    const sport = user.fitnessProfile?.sport || req.body?.sport || null;
    const days = user.fitnessProfile?.workoutDays || ["Mon", "Wed", "Fri"];

    const prompt = `Generate a structured weekly fitness plan:
- Goal: ${goal}
- Level: ${level}
- Sport: ${sport || "none"}
- Available days: ${days.join(", ")}

Return JSON: { "planName": "...", "tier": "basic|intermediate|advanced", "weeklyPlan": [{ "day": "Mon", "workout": { "name": "...", "exercises": [{ "name": "...", "sets": N, "reps": "N" , "duration": "Xmin" }], "totalDuration": "Xmin" } }] }`;

    const fallback = {
      planName: `${level.charAt(0).toUpperCase() + level.slice(1)} ${goal.replace("_", " ")} Plan`,
      tier: level === "beginner" ? "basic" : level === "intermediate" ? "intermediate" : "advanced",
      weeklyPlan: days.map((day) => ({
        day,
        workout: {
          name: "Full Body Workout",
          exercises: [
            { name: "Bodyweight Squats", sets: 3, reps: "12", duration: "5min" },
            { name: "Push-ups", sets: 3, reps: "10", duration: "5min" },
            { name: "Plank Hold", sets: 3, reps: "30s", duration: "3min" },
            { name: "Lunges", sets: 3, reps: "10 each", duration: "5min" },
          ],
          totalDuration: "30min",
        },
      })),
    };

    const result = await generateJSON(prompt, {
      cacheKey: `fitness_plan_${userId}`,
      fallback,
    });

    return res.status(200).json({ success: true, plan: result });
  } catch (err) {
    console.error("Fitness plan error:", err);
    return res.status(500).json({ success: false, message: "Server error generating fitness plan" });
  }
};

// ─── POST /api/ai/confidence-script ────────────────────────
export const generateConfidenceScript = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;
    const { event, anxietyLevel, trigger } = req.body;

    const { allowed } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded" });

    const sport = user?.fitnessProfile?.sport || "your activity";
    const goal = user?.fitnessProfile?.goal || "performance";
    const subject = event || trigger || "facing a tough moment";

    const prompt = `Generate a personalized 60-second pre-performance mental boost script for someone preparing for: "${subject}". Their sport/goal is ${sport}/${goal}. Their anxiety level is ${anxietyLevel || 5}/10. The script should be calming, empowering, and personal. Use second-person ("you"). Keep it under 150 words.`;

    const fallback = `You've prepared for this moment. Your body knows what to do — trust your training. Take a deep breath in... and slowly exhale. Feel your feet grounded on the earth. You are strong, capable, and ready. When you step forward, remember: this is YOUR moment. Every practice session, every push-up, every early morning has built you for exactly this. You don't need to be perfect — you just need to be present. Breathe. Focus. Go.`;

    const script = await generateText(prompt, { fallback });

    return res.status(200).json({ success: true, script });
  } catch (err) {
    console.error("Confidence script error:", err);
    return res.status(500).json({ success: false, message: "Server error generating script" });
  }
};

// ─── POST /api/ai/analyze-meal ─────────────────────────────
export const analyzeMeal = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;
    const { image, mimeType } = req.body; // base64 image

    if (!image) return res.status(400).json({ success: false, message: "Image is required" });

    const { allowed } = checkRateLimit(userId);
    if (!allowed) return res.status(429).json({ success: false, message: "Rate limit exceeded" });

    const prompt = `Identify this Indian food and estimate its nutritional content. Return ONLY valid JSON: { "name": "food name", "calories": number, "protein": number (grams), "carbs": number (grams), "fat": number (grams), "fiber": number (grams), "servingSize": "description" }`;

    const fallback = JSON.stringify({
      name: "Meal (analysis unavailable)",
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 10,
      fiber: 5,
      servingSize: "1 serving (estimated)",
    });

    const result = await analyzeImage(image, prompt, { fallback, mimeType });

    let parsed;
    try {
      parsed = typeof result === "string" ? JSON.parse(result) : result;
    } catch {
      parsed = JSON.parse(fallback);
    }

    return res.status(200).json({ success: true, analysis: parsed });
  } catch (err) {
    console.error("Meal analysis error:", err);
    return res.status(500).json({ success: false, message: "Server error analyzing meal" });
  }
};

// ─── GET /api/ai/goals-agent ───────────────────────────────
export const runGoalsAgent = async (req, res) => {
  try {
    const user = await resolveUser(req);
    const userId = user._id;

    const prompt = `You are an agentic wellness coach analyzing a user's weekly data:
- Streak: ${user.streak || 0} days
- XP: ${user.xp || 0}
- Level: ${user.level || 1}
- User type: ${user.userType || "smoker"}

Analyze their progress and return JSON: { "insights": ["..."], "adjustments": ["..."], "weeklyGoal": "..." }`;

    const fallback = {
      insights: [
        "You're making steady progress. Keep up the consistency!",
        "Your engagement with the app shows strong commitment.",
      ],
      adjustments: [
        "Try to log your activities more consistently throughout the day.",
      ],
      weeklyGoal: "Maintain your current streak and complete at least 3 daily goals.",
    };

    const result = await generateJSON(prompt, {
      cacheKey: `goals_agent_${userId}`,
      fallback,
    });

    return res.status(200).json({
      success: true,
      agentReport: result,
      summary: result?.weeklyGoal || result?.insights?.join(". "),
    });
  } catch (err) {
    console.error("Goals agent error:", err);
    return res.status(500).json({ success: false, message: "Server error running goals agent" });
  }
};

// ─── GET /api/ai/daily-tip ─────────────────────────────────
export const getDailyTip = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

    const tips = [
      "Drink a tall glass of cold water when a craving hits. It stimulates the vagus nerve and calms your body.",
      "Chew sugar-free gum or munch on carrot sticks to keep your mouth occupied during cravings.",
      "Take a 5-minute walk outside. Fresh air and movement are natural craving killers.",
      "Practice the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s. Repeat 3 times.",
      "Tell someone about your quit journey today. Social accountability boosts success rates by 65%.",
      "Avoid your #1 trigger situation today. Plan an alternative activity instead.",
      "Celebrate your progress! Look at how much money you've saved since quitting.",
    ];

    const tip = tips[dayOfYear % tips.length];

    return res.status(200).json({ success: true, tip, dayOfYear });
  } catch (err) {
    console.error("Daily tip error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
