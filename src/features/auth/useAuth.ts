import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getSession,
} from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { handleError, AuthenticationError } from "@/utils/errors";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // First check for existing session from localStorage to avoid flicker
    const storedSession = localStorage.getItem("supabase.auth.token");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession?.currentSession?.user) {
          // Set initial state from localStorage to prevent flicker
          setUser(parsedSession.currentSession.user);
        }
      } catch (error) {
        console.error("Error parsing stored session:", error);
      }
    }

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      });
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "Login failed",
        description: appError.getUserFriendlyMessage(),
        variant: "destructive",
      });
      throw appError; // Re-throw for component handling
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      await signUpWithEmail(email, password, firstName, lastName);
      toast({
        title: "Registration successful",
        description: "Check your email to confirm your account.",
        variant: "success",
      });
    } catch (error) {
      const appError = handleError(error);

      toast({
        title: "Registration failed",
        description: appError.getUserFriendlyMessage(),
        variant: "destructive",
      });
      throw appError; // Re-throw for component handling
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      navigate("/");
      setUser(null);
      setSession(null);
      localStorage.removeItem("supabase.auth.token");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "success",
      });
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: "Error",
        description: "Failed to sign out: " + appError.getUserFriendlyMessage(),
        variant: "destructive",
      });
    }
  };

  return { session, user, loading, signIn, signUp, signOut };
}
