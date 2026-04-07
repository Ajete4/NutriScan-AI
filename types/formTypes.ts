import type { Profile } from "@/types/profile";

export type FormProfile = Partial<
  Omit<Profile, "id" | "full_name" | "updated_at">
>;

export type FormUpdater = <K extends keyof FormProfile>(
  field: K,
  value: FormProfile[K]
) => void;