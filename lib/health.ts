import type { Profile } from "@/types/profile";

export function calculateCalories(profile: Profile): number {
  const { weight, height, age, gender, activity_level, goal } = profile;

  const bmr =
    gender === "Mashkull"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMap: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };

  let calories = bmr * activityMap[activity_level];

  if (goal === "Humbje peshe") calories -= 400;
  if (goal === "Shtim muskulor") calories += 300;

  return Math.round(calories);
}

export function calculateMacros(calories: number) {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fats: Math.round((calories * 0.3) / 9),
  };
}