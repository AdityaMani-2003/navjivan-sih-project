import { GoogleGenerativeAI } from "@google/generative-ai";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour default TTL

export const MOCK_QUIT_PLAN = {
  planName: "Your 30-Day Quit Journey",
  duration: 30,
  quitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  strategy: "cold_turkey",
  goals: [
    { id: "g1", title: "Stay smoke-free for 24 hours", type: "milestone", deadline: 1 },
    { id: "g2", title: "Complete first week smoke-free", type: "milestone", deadline: 7 },
  ],
  weeklyStructure: [
    {
      week: 1,
      theme: "Breaking the Physical Habit",
      focus: "Managing withdrawal symptoms and immediate cravings",
      dailyTasks: [
        { title: "Morning deep breathing (5 minutes)", category: "mindfulness", duration: 5, xpReward: 20 },
        { title: "Drink 2 extra glasses of water", category: "nutrition", duration: 2, xpReward: 10 },
        { title: "Log any cravings in the app", category: "cessation", duration: 1, xpReward: 15 },
      ],
    },
    {
      week: 2,
      theme: "Identifying Hidden Triggers",
      focus: "Rewiring post-meal and stress rituals",
      dailyTasks: [
        { title: "5-minute brisk walk after lunch", category: "fitness", duration: 5, xpReward: 20 },
        { title: "Review your money saved milestone", category: "mindfulness", duration: 2, xpReward: 15 },
      ],
    },
  ],
  copingStrategies: [
    "4-7-8 breathing when craving hits",
    "Call a supportive friend or Quitline 1800-11-2356",
    "Take a 5-minute brisk walk",
  ],
  motivationalMessage: "Every hour without tobacco is your body starting to heal.",
};

export const MOCK_FITNESS_PLAN = {
  planName: "Your Personalized Progressive Wellness Plan",
  level: "basic",
  duration: 30,
  goals: [
    { id: "f1", title: "Reach 5,000 steps daily", type: "milestone", deadline: 7 },
    { id: "f2", title: "Complete 3 weekly mobility sessions", type: "milestone", deadline: 14 },
  ],
  weeklyStructure: [
    {
      week: 1,
      theme: "Foundational Movement",
      focus: "Building consistency and gentle cardio",
      dailyTasks: [
        { title: "Morning mobility stretch (10 mins)", category: "fitness", duration: 10, xpReward: 25 },
        { title: "Track today's water intake (2L)", category: "nutrition", duration: 1, xpReward: 10 },
        { title: "20-minute evening walk", category: "fitness", duration: 20, xpReward: 30 },
      ],
    },
  ],
  motivationalMessage: "Small consistent daily actions create extraordinary long-term transformations.",
};

export const MOCK_DISEASE_RISK = {
  overallRisk: "moderate",
  disclaimer: "This is a general wellness awareness tool, not a medical diagnosis. Please consult a qualified physician.",
  diseases: [
    {
      name: "COPD",
      riskPercentage: 28,
      severity: "moderate",
      timeframe: "Develops over years of chronic respiratory exposure",
      explanation: "Tobacco smoke causes chronic bronchial inflammation. Your usage history shows elevated risk.",
      ifYouQuit: "COPD progression drops sharply upon quitting. Bronchial cilia begin regenerating within weeks.",
    },
    {
      name: "Coronary Heart Disease",
      riskPercentage: 22,
      severity: "moderate",
      timeframe: "Elevated risk while active tobacco user",
      explanation: "Carbon monoxide and nicotine restrict blood vessels and increase arterial plaque formation.",
      ifYouQuit: "Heart attack risk is cut in half just 1 year after quitting.",
    },
    {
      name: "Lung Cancer",
      riskPercentage: 14,
      severity: "low",
      timeframe: "Risk increases significantly after 10+ pack-years",
      explanation: "Carcinogens in tobacco damage DNA in lung epithelial cells.",
      ifYouQuit: "10 years after quitting, your lung cancer risk drops to half that of a continuing smoker.",
    },
    {
      name: "Stroke",
      riskPercentage: 16,
      severity: "low",
      timeframe: "Associated with arterial constriction and elevated blood pressure",
      explanation: "Smoking thickens blood and increases the likelihood of cerebral blood clots.",
      ifYouQuit: "Within 2 to 5 years after quitting, stroke risk falls to that of a non-smoker.",
    },
    {
      name: "Oral Cancer",
      riskPercentage: 18,
      severity: "moderate",
      timeframe: "Direct mucosal exposure risk",
      explanation: "Direct contact with toxic tobacco chemicals harms oral tissues.",
      ifYouQuit: "Risk of mouth and throat cancer decreases by 50% within 5 years of cessation.",
    },
  ],
};

export const MOCK_MEAL_ANALYSIS = {
  foodName: "Balanced Mixed Indian Plate (Dal, Roti, Sabzi)",
  calories: 460,
  protein: 18,
  carbs: 64,
  fat: 14,
  fiber: 8,
  confidence: 0.92,
  summary: "Wholesome vegetarian meal with healthy complex carbs and fiber.",
};

class GeminiProvider {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Primary is gemini-2.5-flash which is verified and responsive
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateText(prompt, systemPrompt) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const result = await this.model.generateContent(fullPrompt);
        const text = result?.response?.text();
        if (text) return text.trim();
      } catch (err) {
        console.warn(`[Gemini Attempt ${attempt + 1}/3 failed]:`, err.message);
        if (attempt === 2) throw err;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    throw new Error("AI generation failed after 3 attempts");
  }

  async generateJSON(prompt, systemPrompt) {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown backticks, no markdown code block, no explanation. Just raw valid JSON.`;
    const text = await this.generateText(jsonPrompt, systemPrompt);
    // Robustly strip any markdown formatting if the model enclosed it in backticks
    const clean = text.replace(/^```json/im, "").replace(/^```/im, "").replace(/```$/m, "").trim();
    return JSON.parse(clean);
  }

  async generateFromImage(imageBase64, mimeType, prompt) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const result = await this.visionModel.generateContent([
      { inlineData: { data: cleanBase64, mimeType: mimeType || "image/jpeg" } },
      prompt,
    ]);
    return result.response.text().trim();
  }
}

class MockProvider {
  async generateText(prompt) {
    if (prompt.includes("motivat") || prompt.includes("tip")) {
      return "Every healthy choice you make today is an investment in your future strength and vitality. Keep going!";
    }
    return "Hello! I am Navjivan, your wellness companion. How can I assist your health journey today?";
  }

  async generateJSON(prompt) {
    if (prompt.includes("quit") || prompt.includes("cessation") || prompt.includes("smok")) {
      return MOCK_QUIT_PLAN;
    }
    if (prompt.includes("fitness") || prompt.includes("workout")) {
      return MOCK_FITNESS_PLAN;
    }
    if (prompt.includes("disease") || prompt.includes("risk")) {
      return MOCK_DISEASE_RISK;
    }
    if (prompt.includes("meal") || prompt.includes("nutrition")) {
      return MOCK_MEAL_ANALYSIS;
    }
    return { success: true, message: "Mock response" };
  }

  async generateFromImage() {
    return JSON.stringify(MOCK_MEAL_ANALYSIS);
  }
}

const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
export const aiService = hasApiKey ? new GeminiProvider() : new MockProvider();

export async function cachedAICall(cacheKey, ttlSeconds, fn) {
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const result = await fn();
  cache.set(cacheKey, result, ttlSeconds || 3600);
  return result;
}

export const generateText = (prompt, systemPrompt) => aiService.generateText(prompt, systemPrompt);
export const generateJSON = (prompt, systemPrompt) => aiService.generateJSON(prompt, systemPrompt);
export const analyzeImage = (base64, prompt) => aiService.generateFromImage(base64, "image/jpeg", prompt);
export const checkRateLimit = (_userId) => ({ allowed: true, remaining: 30 });

export default aiService;
