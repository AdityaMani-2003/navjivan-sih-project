/**
 * Notification Service Layer
 *
 * Uses Expo Push Notifications for now. FCM structure prepared for future Firebase integration.
 * All sends are mocked during development — never crash if token is missing.
 */

import axios from "axios";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// ─── Notification Types ────────────────────────────────────
export const NOTIFICATION_TYPES = {
  DAILY_MOTIVATION: "daily_motivation",
  STREAK_ALERT: "streak_alert",
  GEOFENCING_ALERT: "geofencing_alert",
  COMMUNITY_INTERACTION: "community_interaction",
  MILESTONE_REACHED: "milestone_reached",
  AI_WEEKLY_SUMMARY: "ai_weekly_summary",
  CRAVING_CHECK: "craving_check",
};

/**
 * Send a push notification via Expo Push API
 *
 * @param {string} expoPushToken - The user's Expo push token
 * @param {object} notification - { title, body, data }
 * @returns {Promise<boolean>} - true if sent successfully
 */
export async function sendPushNotification(expoPushToken, notification) {
  if (!expoPushToken) {
    console.log("[Notifications] No push token, skipping send");
    return false;
  }

  // Validate token format
  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    console.log("[Notifications] Invalid token format:", expoPushToken);
    return false;
  }

  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: notification.title || "LastPuff",
      body: notification.body || "",
      data: notification.data || {},
      priority: "high",
      channelId: "default",
    };

    const response = await axios.post(EXPO_PUSH_URL, message, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    console.log("[Notifications] Sent:", response.data);
    return true;
  } catch (err) {
    console.error("[Notifications] Send failed:", err.message);
    return false;
  }
}

/**
 * Send notification to multiple users
 *
 * @param {Array<{token: string, title: string, body: string, data?: object}>} messages
 */
export async function sendBulkNotifications(messages) {
  const validMessages = messages
    .filter((m) => m.token)
    .map((m) => ({
      to: m.token,
      sound: "default",
      title: m.title,
      body: m.body,
      data: m.data || {},
      priority: "high",
    }));

  if (validMessages.length === 0) return;

  try {
    // Expo supports batching up to 100 at a time
    const chunks = [];
    for (let i = 0; i < validMessages.length; i += 100) {
      chunks.push(validMessages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    }

    console.log(`[Notifications] Sent ${validMessages.length} bulk notifications`);
  } catch (err) {
    console.error("[Notifications] Bulk send failed:", err.message);
  }
}

/**
 * FCM Service Layer (placeholder for future Firebase integration)
 * When Firebase is configured, replace Expo Push with FCM calls.
 */
export async function sendFCMNotification(_fcmToken, _notification) {
  // Placeholder: requires google-services.json and Firebase Admin SDK
  console.log("[FCM] FCM not configured. Using Expo Push instead.");
  return false;
}

export default {
  sendPushNotification,
  sendBulkNotifications,
  sendFCMNotification,
  NOTIFICATION_TYPES,
};
