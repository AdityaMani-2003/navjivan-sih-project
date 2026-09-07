import StepLog from "../models/StepLog.js";
import dayjs from "dayjs";

// Padyatra routes with total distances
const PADYATRA_ROUTES = {
  dandi_march: { name: "Dandi March", totalKm: 390, description: "Gandhi's Salt March" },
  char_dham: { name: "Char Dham Yatra", totalKm: 1200, description: "Badrinath → Kedarnath → Gangotri → Yamunotri" },
  golden_triangle: { name: "Golden Triangle", totalKm: 750, description: "Delhi → Agra → Jaipur" },
  kashi_corridor: { name: "Kashi Corridor", totalKm: 84, description: "Varanasi Ghats Walk" },
};

const STEPS_PER_KM = 1250; // 1000 steps ≈ 0.8 km → 1250 steps = 1 km

// POST /api/steps/sync
export const syncSteps = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { steps, date, padyatraRoute } = req.body;
    const logDate = date || dayjs().format("YYYY-MM-DD");

    let log = await StepLog.findOne({ userId, date: logDate });
    if (log) {
      log.steps = steps || log.steps;
      if (padyatraRoute) log.padyatraRoute = padyatraRoute;
      log.kmProgress = (log.steps || 0) / STEPS_PER_KM;
    } else {
      log = new StepLog({
        userId,
        date: logDate,
        steps: steps || 0,
        padyatraRoute: padyatraRoute || null,
        kmProgress: (steps || 0) / STEPS_PER_KM,
      });
    }

    await log.save();
    return res.status(200).json({ success: true, log });
  } catch (err) {
    console.error("Sync steps error:", err);
    return res.status(500).json({ success: false, message: "Server error syncing steps" });
  }
};

// GET /api/steps/padyatra?route=dandi_march
export const getPadyatraProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const route = req.query.route || "dandi_march";
    const routeInfo = PADYATRA_ROUTES[route] || PADYATRA_ROUTES.dandi_march;

    const logs = await StepLog.find({ userId }).lean();
    const totalSteps = logs.reduce((sum, l) => sum + (l.steps || 0), 0);
    const totalKm = totalSteps / STEPS_PER_KM;
    const progress = Math.min(1, totalKm / routeInfo.totalKm);

    return res.status(200).json({
      success: true,
      route: routeInfo,
      totalSteps,
      totalKm: Math.round(totalKm * 10) / 10,
      progress: Math.round(progress * 1000) / 10, // percentage with 1 decimal
      routes: PADYATRA_ROUTES,
    });
  } catch (err) {
    console.error("Padyatra progress error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
