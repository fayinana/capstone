/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

export const updateUserProfile = async (userId: string, profile: any) => {
  const { first_name, last_name, phone_number } = profile;

  const { data, error } = await supabase
    .from("profiles")
    .update({ first_name, last_name, phone_number })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
