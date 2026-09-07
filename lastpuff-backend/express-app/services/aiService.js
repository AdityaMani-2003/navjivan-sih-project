/**
 * Provider-agnostic AI Service Layer
 *
 * Supports Gemini (primary) and Claude (future). Switch via AI_PROVIDER env var.
 * All AI endpoints must return sensible fallbacks when API keys are missing.
 *
 * Features: retry logic (3 attempts), response caching (1hr), rate limiting per user.
 */

import NodeCache from "node-cache";

// ─── Cache: 1 hour TTL ────────────────────────────────────
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// ─── Rate Limiter: per-user map ────────────────────────────
const rateLimitMap = new Map(); // userId -> { count, resetTime }
const RATE_LIMIT_MAX = 10; // 10 AI calls per hour per user
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Check if user is rate-limited
 * @param {string} userId
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// ─── Provider Detection ────────────────────────────────────
function getProvider() {
  return process.env.AI_PROVIDER || "gemini";
}

function hasApiKey() {
  const provider = getProvider();
  if (provider === "gemini") return !!process.env.GEMINI_API_KEY;
  if (provider === "anthropic" || provider === "claude")
    return !!process.env.AI_API_KEY;
  return false;
}

// ─── Gemini Implementation ─────────────────────────────────
async function callGemini(prompt, options = {}) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = options.model || "gemini-3.6-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Gemini request timed out")), 4000)
  );

  const generatePromise = model.generateContent(prompt).then((result) => {
    return result.response.text()?.trim() || "";
  });

  return await Promise.race([generatePromise, timeoutPromise]);
}

// ─── Claude Implementation (future) ────────────────────────
async function callClaude(prompt, _options = {}) {
  throw new Error("Claude provider not yet configured. Set AI_PROVIDER=gemini.");
}

// ─── Retry wrapper ─────────────────────────────────────────
async function withRetry(fn, maxRetries = 1) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`AI call attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError;
}

// ─── Unified Generate Text ────────────────────────────────
/**
 * Generate text using the configured AI provider.
 * Returns fallback if no API key or all retries fail.
 *
 * @param {string} prompt - The prompt to send
 * @param {object} options - { cacheKey, fallback, model }
 * @returns {Promise<string>}
 */
export async function generateText(prompt, options = {}) {
  const { cacheKey, fallback = "", model } = options;

  // Check cache
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  // No API key → return fallback
  if (!hasApiKey()) {
    return fallback || "AI features require an API key. Please configure GEMINI_API_KEY in your .env file.";
  }

  try {
    const provider = getProvider();
    const generate =
      provider === "gemini"
        ? () => callGemini(prompt, { model })
        : () => callClaude(prompt, { model });

    const result = await withRetry(generate, 3);

    // Cache result
    if (cacheKey && result) {
      cache.set(cacheKey, result);
    }

    return result;
  } catch (err) {
    console.error("AI generateText failed after retries:", err.message);
    return fallback || "I'm having trouble thinking right now. Please try again in a moment.";
  }
}

/**
 * Generate structured JSON output from AI.
 * Wraps generateText and parses the response as JSON.
 *
 * @param {string} prompt - Must instruct AI to return valid JSON
 * @param {object} options - { cacheKey, fallback (object), model }
 * @returns {Promise<object>}
 */
export async function generateJSON(prompt, options = {}) {
  const { cacheKey, fallback = {}, model } = options;

  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const text = await generateText(jsonPrompt, {
    cacheKey,
    fallback: JSON.stringify(fallback),
    model,
  });

  try {
    // Try to extract JSON from the response (handle markdown code fences)
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim());
  } catch (parseErr) {
    console.warn("AI JSON parse failed, returning fallback:", parseErr.message);
    return fallback;
  }
}

/**
 * Analyze an image using Vision AI (Gemini Vision).
 *
 * @param {string} base64Image - Base64 encoded image
 * @param {string} prompt - Analysis prompt
 * @param {object} options - { cacheKey, fallback, mimeType }
 * @returns {Promise<string>}
 */
export async function analyzeImage(base64Image, prompt, options = {}) {
  const { fallback = "", mimeType = "image/jpeg" } = options;

  if (!hasApiKey() || getProvider() !== "gemini") {
    return fallback || JSON.stringify({
      name: "Unable to analyze",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    });
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await withRetry(async () => {
      const response = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ]);
      return response.response.text()?.trim() || "";
    }, 3);

    return result;
  } catch (err) {
    console.error("Vision AI failed:", err.message);
    return fallback;
  }
}

/**
 * Clear cached AI response
 * @param {string} cacheKey
 */
export function clearCache(cacheKey) {
  cache.del(cacheKey);
}

export default {
  generateText,
  generateJSON,
  analyzeImage,
  checkRateLimit,
  clearCache,
};
