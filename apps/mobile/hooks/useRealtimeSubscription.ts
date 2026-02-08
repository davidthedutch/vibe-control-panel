import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export function useRealtimeSubscription(options: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`${options.table}-changes`)
      .on(
        'postgres_changes',
        {
          event: options.event,
          schema: 'public',
          table: options.table,
        },
        (payload) => {
          if (options.onChange) {
            options.onChange(payload);
          }

          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload);
              break;
            case 'UPDATE':
              options.onUpdate?.(payload);
              break;
            case 'DELETE':
              options.onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [options.table, options.event]);

  return channelRef.current;
}
