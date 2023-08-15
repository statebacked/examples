import { Session, createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const supabaseClient = createClient(
  "https://tfktuqdsyacioqtgesey.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma3R1cWRzeWFjaW9xdGdlc2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA2NzAxMjgsImV4cCI6MjAwNjI0NjEyOH0.DbsaHGeInVCd417SqyDnp1IIl74_t4dcMwJHtbxzjWw",
);

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  let canceled = false;

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (canceled) {
        return;
      }

      setSession(session);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      canceled = true;
      subscription.unsubscribe();
    };
  }, []);

  return session;
};
