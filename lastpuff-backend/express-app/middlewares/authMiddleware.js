import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);

  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Support instant Demo / Guest Mode testing without hard auth failures
    if (token === "demo_jwt_token_sample" || token.startsWith("demo_") || token === "guest_token") {
      req.user = {
        _id: "660000000000000000000001",
        id: "660000000000000000000001",
        name: "Aditya (Demo Pioneer)",
        email: "demo@navjivan.app",
        userType: "smoker",
        isDemo: true,
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT → your JWT payload is: { id: userId }
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    // Controllers expect req.user._id or req.user.id
    req.user = { _id: userId, id: userId };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const authMiddleware = authenticate;
export default authenticate;
