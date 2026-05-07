import { createClient } from "@/lib/supabase/client";

type LoginData = {
  email: string;
  password: string;
};

export async function loginUser(data: LoginData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error };
  }

  return { error: null };
}