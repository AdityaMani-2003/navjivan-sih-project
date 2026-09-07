export interface SmokerQuestionnaireState {
  // Section 1: Tobacco Profile
  tobaccoProduct: string[];
  durationOfUse: string;
  frequencyPerDay: number;
  timeToFirstUse: string;
  nightUse: boolean;
  dailySpend: number;

  // Section 2: Cravings
  cravingFrequency: string;
  cravingIntensity: number; // 1-5
  cravingResistance: number; // 1-5

  // Section 3: Triggers
  triggers: string[];

  // Section 4: Quit History
  triedQuitBefore: boolean;
  previousQuitAttempts?: number;
  previousQuitMethods?: string[];
  longestSmokeFreePeriod?: string;
  relapseReasons?: string[];

  // Section 5: Motivation & Readiness
  motivationScore: number; // 0-10
  confidenceScore: number; // 0-10
  importanceScore: number; // 0-10
  quitTimeline: string;
  socialSupport: string;
  emergencyContactAvailable: boolean;
}

export const TOBACCO_PRODUCTS = [
  { id: "cigarettes", label: "Cigarettes" },
  { id: "bidis", label: "Bidis" },
  { id: "gutkha", label: "Gutkha / Smokeless" },
  { id: "hookah", label: "Hookah" },
  { id: "vape", label: "Vape / E-Cigarette" },
  { id: "cigars", label: "Cigars" },
  { id: "other", label: "Other Tobacco" },
];

export const DURATION_OPTIONS = [
  { id: "under_6_months", label: "< 6 Months" },
  { id: "6mo_to_1yr", label: "6 Months - 1 Year" },
  { id: "1_to_3_yrs", label: "1 - 3 Years" },
  { id: "3_to_5_yrs", label: "3 - 5 Years" },
  { id: "5_to_10_yrs", label: "5 - 10 Years" },
  { id: "over_10_yrs", label: "10+ Years" },
];

export const TIME_TO_FIRST_USE_OPTIONS = [
  { id: "within_5_min", label: "Within 5 minutes" },
  { id: "6_to_30_min", label: "6 - 30 minutes" },
  { id: "31_to_60_min", label: "31 - 60 minutes" },
  { id: "after_60_min", label: "After 60 minutes" },
];

export const CRAVING_FREQUENCY_OPTIONS = [
  { id: "rarely", label: "Rarely" },
  { id: "a_few_times_day", label: "A few times a day" },
  { id: "several_times_day", label: "Several times a day" },
  { id: "very_frequently", label: "Very frequently" },
  { id: "almost_constantly", label: "Almost constantly" },
];

export const TRIGGER_OPTIONS = [
  { id: "stress", label: "Stress / Pressure" },
  { id: "after_meals", label: "After Meals" },
  { id: "tea_coffee", label: "With Chai / Coffee" },
  { id: "boredom", label: "Boredom" },
  { id: "friends_smoke", label: "Friends Smoking" },
  { id: "work_pressure", label: "Work Breaks" },
  { id: "alcohol", label: "Social Drinks" },
  { id: "anxiety", label: "Anxiety / Restlessness" },
  { id: "travel", label: "Driving / Commute" },
  { id: "habit_routine", label: "Habitual Routine" },
];

export const QUIT_METHODS_OPTIONS = [
  { id: "stopped_suddenly", label: "Stopped Suddenly (Cold Turkey)" },
  { id: "gradually_reduced", label: "Gradually Reduced" },
  { id: "nicotine_replacement", label: "Nicotine Gums / Patches" },
  { id: "family_support", label: "Family / Friend Support" },
  { id: "counselling", label: "Doctor / Counselor" },
  { id: "other", label: "Other" },
];

export const LONGEST_SMOKE_FREE_OPTIONS = [
  { id: "less_than_1_day", label: "< 24 Hours" },
  { id: "1_to_7_days", label: "1 - 7 Days" },
  { id: "1_to_4_weeks", label: "1 - 4 Weeks" },
  { id: "1_to_6_months", label: "1 - 6 Months" },
  { id: "over_6_months", label: "6+ Months" },
];

export const RELAPSE_REASON_OPTIONS = [
  { id: "cravings", label: "Overwhelming Cravings" },
  { id: "stress", label: "Severe Stress Episode" },
  { id: "social_pressure", label: "Social Pressure" },
  { id: "alcohol_social", label: "Partying / Alcohol" },
  { id: "loss_of_motivation", label: "Loss of Motivation" },
  { id: "withdrawal_symptoms", label: "Withdrawal Discomfort" },
];

export const QUIT_TIMELINE_OPTIONS = [
  { id: "immediately", label: "Immediately (Today)" },
  { id: "within_1_week", label: "Within 1 Week" },
  { id: "within_1_month", label: "Within 1 Month" },
  { id: "within_3_months", label: "Within 3 Months" },
  { id: "not_ready_yet", label: "Not Ready Yet (Exploring)" },
];
