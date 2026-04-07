import type { DietType, ActivityLevel, Goal } from "@/types/profile";

export const DIET_TYPES: DietType[] = [
  "Omnivore",
  "Vegan",
  "Vegetarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
];

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "lightly_active",
  "moderate",
  "very_active",
  "athlete",
];

export const GOALS: Goal[] = [
  "Weight Loss",
  "Maintenance",
  "Muscle Gain",
  "Sports Performance",
];