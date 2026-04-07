export type Gender = "Male" | "Female";

export type DietType =
  | "Omnivore"
  | "Vegan"
  | "Vegetarian"
  | "Keto"
  | "Paleo"
  | "Gluten-Free";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderate"
  | "very_active"
  | "athlete";

export type Goal =
  | "Weight Loss"
  | "Maintenance"
  | "Muscle Gain"
  | "Sports Performance";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  diet_type: DietType;
  activity_level: ActivityLevel;
  goal: Goal;
  allergies: string | null;
  intolerances: string | null;
  chronic_conditions: string | null;
  meal_frequency: number | null;
  updated_at: string;
}