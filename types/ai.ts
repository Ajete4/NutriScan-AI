export type DailyMealItem = {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  description: string;
};

export type WeeklyMealItem = {
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type WeeklyDayPlan = {
  day: number;
  meals: WeeklyMealItem[];
};

export type AIPlanData = {
  daily_plan: DailyMealItem[];
  weekly_plan: WeeklyDayPlan[];
  monthly_tips: string[];
  explanation?: string[];
};

export type AIPlan = AIPlanData & {
  id: string;
  user_id: string;
  created_at: string;
};
