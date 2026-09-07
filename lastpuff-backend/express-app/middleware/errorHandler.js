export const globalErrorHandler = (err, req, res, _next) => {
  const isDev = process.env.NODE_ENV !== "production";

  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  if (isDev && err.stack) console.error(err.stack);

  // MongoDB duplicate key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(400).json({
      success: false,
      error: field === "email" ? "This email is already registered" : `Duplicate entry for ${field}`,
      code: "DUPLICATE_KEY",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // AI errors — return 200 with fallback, NEVER 500
  if (
    err.message?.includes("AI") ||
    err.message?.includes("Gemini") ||
    err.message?.includes("GenerativeAI")
  ) {
    return res.status(200).json({
      success: true,
      data: err.fallbackData || { mock: true, error: "AI temporarily unavailable" },
      warning: "AI service temporarily unavailable — showing fallback content",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : "Something went wrong. Please try again.",
    code: err.code || "INTERNAL_ERROR",
  });
};

export default globalErrorHandler;
