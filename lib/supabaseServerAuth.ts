import { createClient, type User } from "@supabase/supabase-js";

type AuthResult =
  | { user: User; error: null }
  | { user: null; error: string };

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthResult> {
  const token = getBearerToken(req);

  if (!token) {
    return { user: null, error: "Authentication required." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: "Authentication service is not configured." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Invalid or expired session." };
  }

  return { user, error: null };
}
