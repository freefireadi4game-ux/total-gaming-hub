import { supabase as cloudSupabase } from "@/integrations/supabase/client";

type UntypedSupabaseClient = {
  from: (table: string) => QueryBuilder;
};

type SupabaseResponse = {
  data: Record<string, unknown>[] | null;
  error: unknown;
};

type QueryBuilder = PromiseLike<SupabaseResponse> & {
  insert: (values: Record<string, unknown>) => QueryBuilder;
  update: (values: Record<string, unknown>) => QueryBuilder;
  delete: () => QueryBuilder;
  select: (columns?: string) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: string[]) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  single: () => Promise<{
    data: Record<string, unknown> | null;
    error: unknown;
  }>;
};

export const supabase = cloudSupabase as unknown as UntypedSupabaseClient;
