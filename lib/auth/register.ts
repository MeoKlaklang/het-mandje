import { createClient } from "@/lib/supabase/client";

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
};

export async function registerUser(data: RegisterData) {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error };
  }

  const userId = authData.user?.id;

  if (!userId) {
    return { error: new Error("Geen user id gevonden.") };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    first_name: data.firstName,
    last_name: data.lastName,
    birth: data.birthDate,
  });

  if (profileError) {
    return { error: profileError };
  }

  return { error: null };
}