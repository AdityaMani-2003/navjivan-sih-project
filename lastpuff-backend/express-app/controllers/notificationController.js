import User from "../models/User.js";

// POST /api/notifications/register-token
export const registerToken = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { expoPushToken, fcmToken } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (expoPushToken) user.expoPushToken = expoPushToken;
    if (fcmToken) user.fcmToken = fcmToken;
    await user.save();

    return res.status(200).json({ success: true, message: "Token registered" });
  } catch (err) {
    console.error("Register token error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/notifications/send (admin endpoint — no auth check for now, add later)
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: "userId and title required" });
    }

    const user = await User.findById(userId).lean();
    if (!user || !user.expoPushToken) {
      return res.status(404).json({ success: false, message: "User or push token not found" });
    }

    // Import dynamically to avoid circular dependency
    const { sendPushNotification } = await import("../services/notifications.js");
    const sent = await sendPushNotification(user.expoPushToken, { title, body, data });

    return res.status(200).json({ success: true, sent });
  } catch (err) {
    console.error("Send notification error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
