import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseQueryOptions<T> {
  table: string;
  select?: string;
  filter?: (query: any) => any;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

export function useSupabaseQuery<T = any>(options: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(options.table).select(options.select || '*');

      if (options.filter) {
        query = options.filter(query);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.single) {
        query = query.single();
      }

      const { data, error } = await query;

      if (error) throw error;

      setData(data as T);
    } catch (err) {
      setError(err as Error);
      console.error('Supabase query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.table, options.select, options.limit]);

  return { data, loading, error, refetch: fetchData };
}
