/**
 * Cron Jobs Service
 *
 * Registers recurring tasks: weekly AI report (Sunday 6 PM), daily motivation (8 AM).
 * Uses node-cron for scheduling.
 */

import cron from "node-cron";
import User from "../models/User.js";
import { generateText } from "./aiService.js";
import { sendPushNotification, NOTIFICATION_TYPES } from "./notifications.js";

/**
 * Register all cron jobs
 */
export function registerCronJobs() {
  console.log("[Cron] Registering scheduled jobs...");

  // ─── Weekly AI Report: Every Sunday at 6 PM IST ─────────
  cron.schedule(
    "0 18 * * 0",
    async () => {
      console.log("[Cron] Running weekly AI report generation...");
      try {
        await generateWeeklyReports();
      } catch (err) {
        console.error("[Cron] Weekly report error:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  // ─── Daily Motivation: Every day at 8 AM IST ─────────────
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("[Cron] Sending daily motivation...");
      try {
        await sendDailyMotivation();
      } catch (err) {
        console.error("[Cron] Daily motivation error:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  // ─── Streak Check: Every day at 9 PM IST ──────────────────
  cron.schedule(
    "0 21 * * *",
    async () => {
      console.log("[Cron] Running streak alerts...");
      try {
        await sendStreakAlerts();
      } catch (err) {
        console.error("[Cron] Streak alert error:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("[Cron] All jobs registered successfully");
}

/**
 * Generate and send weekly AI reports to all users with push tokens
 */
async function generateWeeklyReports() {
  const users = await User.find({ expoPushToken: { $ne: null } }).lean();

  for (const user of users) {
    try {
      const weekNumber = Math.ceil(
        ((new Date() - new Date(user.quitDate || user.createdAt)) /
          (1000 * 60 * 60 * 24)) /
          7
      );

      await sendPushNotification(user.expoPushToken, {
        title: `📊 Your Week ${weekNumber} Report is Ready`,
        body: "Tap to see your weekly progress summary and next week's goals.",
        data: { type: NOTIFICATION_TYPES.AI_WEEKLY_SUMMARY },
      });
    } catch (err) {
      console.warn(`[Cron] Failed to send report to user ${user._id}:`, err.message);
    }
  }
}

/**
 * Send daily motivational notification
 */
async function sendDailyMotivation() {
  const users = await User.find({ expoPushToken: { $ne: null } }).lean();

  const tips = [
    "Every smoke-free breath is a victory. You're doing amazing! 🌟",
    "Your lungs are healing right now. Keep going, champion! 💪",
    "Today is another day of choosing health over habit. Proud of you! 🏆",
    "Remember why you started this journey. Your future self thanks you! 🌅",
    "Step by step, breath by breath — you're becoming unstoppable! 🔥",
  ];

  const todayTip = tips[new Date().getDay() % tips.length];

  for (const user of users) {
    try {
      await sendPushNotification(user.expoPushToken, {
        title: "🌅 Good Morning, Champion!",
        body: todayTip,
        data: { type: NOTIFICATION_TYPES.DAILY_MOTIVATION },
      });
    } catch (err) {
      // Silent fail per user
    }
  }
}

/**
 * Send streak alerts to users who haven't checked in today
 */
async function sendStreakAlerts() {
  const today = new Date().toISOString().split("T")[0];
  const users = await User.find({
    expoPushToken: { $ne: null },
    lastStreakUpdateDate: { $ne: today },
    streak: { $gt: 0 },
  }).lean();

  for (const user of users) {
    try {
      await sendPushNotification(user.expoPushToken, {
        title: `🔥 Don't lose your ${user.streak}-day streak!`,
        body: "Open LastPuff and log your progress before midnight.",
        data: { type: NOTIFICATION_TYPES.STREAK_ALERT },
      });
    } catch (err) {
      // Silent fail per user
    }
  }
}

export default { registerCronJobs };
