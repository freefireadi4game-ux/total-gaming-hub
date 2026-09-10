import { supabase as cloudSupabase } from "@/integrations/supabase/client";

type UntypedSupabaseClient = {
  from: (table: string) => any;
};

export const supabase = cloudSupabase as unknown as UntypedSupabaseClient;
