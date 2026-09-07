/**
 * Recommendation Engine (Fully Deterministic, No AI)
 * Pure, transparent, and auditable clinical decision rules.
 */

// ─── SMOKING PLAN RECOMMENDATION ─────────────────────────────────────────────

export function recommendSmokingPlan(features) {
  const scores = {
    dependence: calculateDependenceScore(features),
    motivation: Number(features.motivationScore || 7),
    confidence: Number(features.confidenceScore || 6),
    readiness: calculateReadinessScore(features),
    relapseRisk: calculateRelapseRisk(features),
    socialSupport:
      features.socialSupport === "yes"
        ? 8
        : features.socialSupport === "not_sure"
        ? 5
        : 2,
  };

  const reasonCodes = [];

  const freq = Number(features.frequencyPerDay || 10);
  if (freq >= 20) reasonCodes.push("heavy_tobacco_use");
  if (features.timeToFirstUse === "within_5_min") reasonCodes.push("high_morning_dependence");
  if (Number(features.previousQuitAttempts || 0) > 2) reasonCodes.push("multiple_previous_attempts");

  const relapse = Array.isArray(features.relapseReasons) ? features.relapseReasons : [];
  if (relapse.includes("cravings")) reasonCodes.push("craving_driven_relapse");
  if (scores.motivation >= 7) reasonCodes.push("high_motivation");
  if (scores.confidence <= 4) reasonCodes.push("low_confidence");
  if (features.quitTimeline === "immediately") reasonCodes.push("immediate_quit_intent");

  const THRESHOLDS = {
    coldTurkeyMotivation: 7,
    coldTurkeyConfidence: 6,
    coldTurkeyMaxDependence: 6,
  };

  let plan;
  if (
    scores.motivation >= THRESHOLDS.coldTurkeyMotivation &&
    scores.confidence >= THRESHOLDS.coldTurkeyConfidence &&
    scores.dependence <= THRESHOLDS.coldTurkeyMaxDependence &&
    features.quitTimeline === "immediately"
  ) {
    plan = "cold_turkey";
  } else {
    plan = "gradual_reduction";
  }

  const explanation = generateSmokingExplanation(plan, reasonCodes, scores);

  return { plan, reasonCodes, explanation, scores };
}

function calculateDependenceScore(f) {
  let score = 0;
  const freq = Number(f.frequencyPerDay || 10);
  if (freq >= 20) score += 4;
  else if (freq >= 10) score += 2;
  else score += 1;

  if (f.timeToFirstUse === "within_5_min") score += 3;
  else if (f.timeToFirstUse === "6_to_30_min") score += 2;

  if (f.nightUse) score += 2;
  if (Number(f.cravingIntensity || 3) >= 4) score += 2;

  return Math.min(score, 10);
}

function calculateReadinessScore(f) {
  const timelineMap = {
    immediately: 10,
    within_1_week: 8,
    within_1_month: 6,
    within_3_months: 4,
    not_ready_yet: 1,
  };
  return timelineMap[f.quitTimeline] || 6;
}

function calculateRelapseRisk(f) {
  let risk = 0;
  if (Number(f.previousQuitAttempts || 0) > 3) risk += 3;
  const relapse = Array.isArray(f.relapseReasons) ? f.relapseReasons : [];
  if (relapse.includes("cravings")) risk += 2;
  if (relapse.includes("stress")) risk += 2;
  const triggers = Array.isArray(f.triggers) ? f.triggers : [];
  if (triggers.length > 5) risk += 2;
  return Math.min(risk, 10);
}

function generateSmokingExplanation(plan, reasonCodes, scores) {
  if (plan === "cold_turkey") {
    return (
      "Based on your high motivation (" +
      scores.motivation +
      "/10), strong confidence (" +
      scores.confidence +
      "/10), and manageable dependence levels, the Cold Turkey protocol offers your highest statistical probability of permanent freedom. You are ready to make a clean break starting immediately."
    );
  } else {
    return (
      "Because of your daily tobacco patterns, morning craving intensity, and past withdrawal patterns, a Gradual Reduction pathway protects your nervous system from overwhelming shock. We systematically step down daily usage while building sustainable cognitive replacement habits."
    );
  }
}

// ─── FITNESS PLAN RECOMMENDATION ─────────────────────────────────────────────

export function recommendFitnessPlan(features) {
  if (features.hasSafetyRisk) {
    return {
      level: "basic",
      reasonCodes: ["safety_risk_detected"],
      explanation:
        "Based on your health screening answers, we recommend beginning with gentle, restorative movement. Please consult your physician before initiating any vigorous conditioning program.",
    };
  }

  const activityScore = getActivityScore(features.activityFrequency);
  const fitnessLevelScore =
    { beginner: 1, intermediate: 2, advanced: 3 }[features.fitnessLevel] || 1;
  const duration = Number(features.activityDurationMinutes || 25);
  const durationScore = duration >= 45 ? 3 : duration >= 20 ? 2 : 1;

  const totalScore = activityScore + fitnessLevelScore + durationScore;
  const reasonCodes = [];

  if (features.fitnessLevel === "beginner") reasonCodes.push("beginner_fitness_level");
  if (Number(features.bmi || 22) > 30) reasonCodes.push("elevated_bmi");
  if (features.stressLevel === "high" || features.stressLevel === "very_high")
    reasonCodes.push("high_stress");

  let level;
  if (totalScore <= 4) level = "basic";
  else if (totalScore <= 7) level = "intermediate";
  else level = "advanced";

  const explanation = generateFitnessExplanation(level, reasonCodes);

  return { level, reasonCodes, explanation };
}

function getActivityScore(freq) {
  if (freq === "every_day" || freq === "5-6") return 3;
  if (freq === "3-4") return 2;
  return 1;
}

function generateFitnessExplanation(level, reasonCodes) {
  if (level === "basic") {
    return "Designed to build baseline cardiovascular stamina and movement efficiency with low joint impact and progressive daily habits.";
  } else if (level === "intermediate") {
    return "Balanced conditioning incorporating functional resistance training, active recovery, and targeted endurance progression.";
  } else {
    return "High-intensity athletic conditioning structured for peak power, stamina, and progressive overload.";
  }
}
