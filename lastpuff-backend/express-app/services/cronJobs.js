import cron from "node-cron";
import User from "../models/User.js";
import { runWeeklyAgentReview } from "./agentOrchestrator.js";

/**
 * Register background cron jobs for agentic AI and notifications
 */
export function registerCronJobs() {
  console.log("⏰ Registering cron schedules...");

  // Job 1: Sunday 6:00 PM - Run Weekly Agentic AI Review for all active users
  cron.schedule("0 18 * * 0", async () => {
    console.log("🤖 [Cron] Running Sunday Weekly Agentic AI Reviews...");
    try {
      const activeUsers = await User.find({ userType: { $ne: null } })
        .select("_id name")
        .limit(100);

      for (const u of activeUsers) {
        await runWeeklyAgentReview(u._id);
      }
      console.log(`🤖 [Cron] Completed weekly review for ${activeUsers.length} users.`);
    } catch (err) {
      console.error("[Cron Weekly Review Error]:", err.message);
    }
  });

  // Job 2: Daily 9:00 PM - Check daily check-in streaks and trigger notifications
  cron.schedule("0 21 * * *", async () => {
    console.log("🔥 [Cron] Running Daily 9PM Streak Audits...");
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const users = await User.find({ userType: { $ne: null } }).select(
        "_id name streak lastCheckIn expoPushToken"
      );

      for (const u of users) {
        const lastCheck = u.lastCheckIn ? new Date(u.lastCheckIn) : null;
        if (lastCheck) lastCheck.setHours(0, 0, 0, 0);

        if (!lastCheck || lastCheck.getTime() < today.getTime()) {
          // Missed today's check-in
          console.log(`[Streak Warning] User ${u.name} has not checked in today.`);
        }
      }
    } catch (err) {
      console.error("[Cron Streak Audit Error]:", err.message);
    }
  });

  console.log("✅ Cron schedules active: Sunday 6PM Agent Review & Daily 9PM Streak Audit.");
}

export default { registerCronJobs };
