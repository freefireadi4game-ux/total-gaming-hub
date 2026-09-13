import { supabase as cloudSupabase } from "@/integrations/supabase/client";

// Loosely-typed adapter: the generated Database types are empty, so we expose
// a permissive query builder while keeping the real client at runtime.
/* eslint-disable @typescript-eslint/no-explicit-any */
type LooseSupabaseClient = {
  from: (table: string) => any;
  auth: (typeof cloudSupabase)["auth"];
  storage: (typeof cloudSupabase)["storage"];
};

export const supabase = cloudSupabase as unknown as LooseSupabaseClient;
