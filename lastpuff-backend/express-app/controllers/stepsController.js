import StepLog from "../models/StepLog.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

const STEPS_PER_KM = 1250; // 0.0008 km per step

export const syncSteps = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { steps, route = "dandi_march" } = req.body;
    const stepCount = Number(steps || 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const distanceKm = Math.round(stepCount * 0.0008 * 100) / 100;

    let log = await StepLog.findOne({ userId, date: today });
    if (!log) {
      log = new StepLog({
        userId,
        date: today,
        steps: stepCount,
        distanceKm,
        padyatraRoute: route,
        padyatraKmProgress: distanceKm,
      });
    } else {
      log.steps = stepCount;
      log.distanceKm = distanceKm;
      log.padyatraRoute = route;
      log.padyatraKmProgress = distanceKm;
    }
    await log.save();

    // Update today's Progress doc
    await Progress.findOneAndUpdate(
      { userId, date: today },
      { $set: { stepsCount: stepCount } },
      { upsert: true }
    );

    // Calculate total route progress
    const allLogs = await StepLog.find({ userId, padyatraRoute: route }).lean();
    const totalKm = allLogs.reduce((acc, l) => acc + (l.distanceKm || 0), 0);

    res.json({
      success: true,
      data: {
        stepsToday: stepCount,
        kmToday: distanceKm,
        totalKmWalked: totalKm,
        padyatraRoute: route,
        milestoneReached: totalKm >= 5,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPadyatra = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const route = req.query.route || "dandi_march";

    const allLogs = await StepLog.find({ userId, padyatraRoute: route }).lean();
    const totalKm = Math.round(allLogs.reduce((acc, l) => acc + (l.distanceKm || 0), 0) * 10) / 10;

    const routeKmMap = {
      dandi_march: 390,
      golden_triangle: 735,
      kashi_corridor: 84,
    };

    const routeTotalKm = routeKmMap[route] || 390;
    const progress = Math.min(1, totalKm / routeTotalKm);

    res.json({
      success: true,
      data: {
        route,
        totalKm,
        routeTotalKm,
        progress,
        stepsLogged: Math.round(totalKm * STEPS_PER_KM),
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  syncSteps,
  getPadyatra,
};
