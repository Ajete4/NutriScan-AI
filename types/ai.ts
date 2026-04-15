export type DailyMealItem = {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  description: string;
};

export type AIPlanData = {
  daily_plan: DailyMealItem[];
  weekly_plan: string[];
  monthly_tips: string[];
};

export type AIPlan = AIPlanData & {
  id: string;
  user_id: string;
  created_at: string;
};