export interface FitnessQuestionnaireState {
  // Section B: Primary Goal
  primaryGoal: string;

  // Section C: Physical Activity
  activityFrequency: string;
  activityDurationMinutes: number;
  currentActivities: string[];
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  dailySteps: string;
  availableExerciseMinutes: number;

  // Section D: Preferences
  preferredActivities: string[];
  exerciseLocation: string;
  socialPreference: string;
  motivation: string[];

  // Section E: Nutrition
  dietType: string;
  mealsPerDay: number;
  fastFoodFrequency: string;
  sugaryDrinksFrequency: string;
  waterIntakeLitres: number;
  nutritionGoal: string;
  foodAvoidances: string;

  // Section F: Sleep & Stress
  sleepHours: number;
  sleepQuality: string;
  stressLevel: string;
  sedentaryHours: string;
  daytimeTiredness: string;

  // Section G: Safety Screening
  heartCondition: boolean;
  chestPain: boolean;
  dizziness: boolean;
  boneJointCondition: boolean;
  doctorAdvisedAgainstExercise: boolean;
  hasSafetyRisk: boolean;
}

export const PRIMARY_GOALS = [
  { id: "improve_fitness", title: "Improve General Fitness", desc: "Build overall cardiovascular stamina & energy" },
  { id: "build_strength", title: "Build Strength & Muscle", desc: "Progressive resistance & functional hypertrophy" },
  { id: "weight_management", title: "Weight Management", desc: "Burn fat and optimize body composition" },
  { id: "increase_stamina", title: "Increase Stamina & Athleticism", desc: "Sports endurance and high VO2 max" },
  { id: "mental_wellbeing", title: "Stress Relief & Mental Clarity", desc: "Mood elevation through physical movement" },
];

export const ACTIVITY_OPTIONS = [
  { id: "walking", label: "Walking / Padyatra" },
  { id: "running", label: "Jogging / Running" },
  { id: "cycling", label: "Cycling" },
  { id: "gym", label: "Gym / Weights" },
  { id: "yoga", label: "Yoga & Pranayama" },
  { id: "sports", label: "Sports (Cricket, Badminton, etc.)" },
  { id: "home_workouts", label: "Home Calisthenics" },
];

export const DIET_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "non_vegetarian", label: "Non-Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "jain", label: "Jain" },
  { id: "no_restriction", label: "No Restrictions" },
];
