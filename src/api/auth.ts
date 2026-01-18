import { supabase } from "@/integrations/supabase/client";

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) throw new Error(error.message);

  // Ensure user was returned
  const user = data?.user;
  if (!user) throw new Error("User not returned after sign-up");

  // Insert into profiles table
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id, // match `auth.users.id` and your `profiles.id`
    email,
    first_name: firstName,
    last_name: lastName,
  });

  if (profileError) throw new Error(profileError.message);
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
