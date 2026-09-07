import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import Progress from "../models/Progress.js";
import { aiService } from "../services/aiService.js";
import { searchKnowledgeBase } from "../services/vectorService.js";

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { content, sessionId = "default" } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Content is required" });
    }

    // Save user's message
    await ChatMessage.create({
      userId,
      sessionId,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    });

    // 1. Gather user context
    const [user, activePlan, recentProgress, history] = await Promise.all([
      User.findById(userId).lean(),
      Plan.findOne({ userId, status: "active" }).lean(),
      Progress.find({ userId }).sort({ date: -1 }).limit(3).lean(),
      ChatMessage.find({ userId, sessionId }).sort({ timestamp: -1 }).limit(6).lean(),
    ]);

    // 2. Query knowledge base for RAG
    const relevantDocs = await searchKnowledgeBase(content, 3);
    const knowledgeContext = relevantDocs.map((d) => `• ${d.title}: ${d.content}`).join("\n\n");

    // 3. System prompt
    const systemPrompt = `You are Navjivan, an empathetic, scientific AI wellness coach for smoking cessation and fitness.

USER CONTEXT:
- Name: ${user?.name || "Friend"}
- Profile Type: ${user?.userType || "smoker"}
- Current Streak: ${user?.streak || 0} days
- Active Plan: ${activePlan?.planName || "Personalized Routine"}
- Recent Cravings Resisted: ${recentProgress[0]?.cravingsResisted || 0}

CLINICAL & WELLNESS KNOWLEDGE BASE:
${knowledgeContext}

STRICT INSTRUCTIONS:
1. You are NOT a doctor and never offer medical diagnoses. Always recommend consulting licensed professionals for severe medical concerns.
2. If the user mentions medical emergency symptoms (crushing chest pain, severe shortness of breath, suicidal ideation), immediately instruct them: "Please contact emergency services (dial 112 in India) or see a doctor immediately."
3. Be warm, motivating, and specific. Reference their actual progress data when encouraging them.
4. Keep answers concise (under 130 words) unless in-depth explanation is specifically requested.
5. Never hallucinate statistics; use only the knowledge base principles provided.`;

    const reversedHistory = history.reverse();
    const conversationPrompt =
      reversedHistory
        .map((m) => `${m.role === "user" ? "User" : "Navjivan"}: ${m.content}`)
        .join("\n") +
      `\nUser: ${content}\nNavjivan:`;

    let responseText;
    try {
      responseText = await aiService.generateText(conversationPrompt, systemPrompt);
    } catch (aiErr) {
      console.warn("[Chatbot AI Fallback]:", aiErr.message);
      responseText =
        "Take a slow, deep breath in for 4 seconds, hold for 7, and exhale for 8. Remember that cravings peak and begin fading after 3 to 5 minutes. You have the strength to overcome this moment!";
    }

    // Save assistant response
    const assistantMsg = await ChatMessage.create({
      userId,
      sessionId,
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
      contextUsed: relevantDocs.map((d) => d.id),
    });

    res.json({
      success: true,
      data: {
        response: responseText,
        message: responseText,
        chatMessageId: assistantMsg._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = Number(req.query.limit || 30);

    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

export const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await ChatMessage.deleteMany({ userId });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    next(err);
  }
};

export default {
  sendMessage,
  getHistory,
  clearHistory,
};
