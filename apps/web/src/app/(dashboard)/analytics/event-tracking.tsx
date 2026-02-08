'use client';

import { MousePointerClick, FormInput, ScrollText, ExternalLink } from 'lucide-react';

interface EventData {
  eventType: string;
  count: number;
  uniqueUsers: number;
  avgPerSession: number;
}

interface EventTrackingProps {
  events: EventData[];
}

const eventIcons: Record<string, React.ReactNode> = {
  click: <MousePointerClick className="h-4 w-4" />,
  submit: <FormInput className="h-4 w-4" />,
  scroll: <ScrollText className="h-4 w-4" />,
  navigation: <ExternalLink className="h-4 w-4" />,
};

const eventColors: Record<string, string> = {
  click: 'bg-blue-500',
  submit: 'bg-emerald-500',
  scroll: 'bg-purple-500',
  navigation: 'bg-amber-500',
};

export default function EventTracking({ events }: EventTrackingProps) {
  const maxCount = events.length > 0 ? Math.max(...events.map(e => e.count)) : 1;

  function getIconForEvent(eventType: string): React.ReactNode {
    const lowerType = eventType.toLowerCase();
    for (const key in eventIcons) {
      if (lowerType.includes(key)) {
        return eventIcons[key];
      }
    }
    return <MousePointerClick className="h-4 w-4" />;
  }

  function getColorForEvent(eventType: string): string {
    const lowerType = eventType.toLowerCase();
    for (const key in eventColors) {
      if (lowerType.includes(key)) {
        return eventColors[key];
      }
    }
    return 'bg-slate-500';
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Event Tracking
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {events.length} event types
        </span>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center">
          <MousePointerClick className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Geen events getrackt
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Events worden automatisch vastgelegd via de analytics SDK
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const icon = getIconForEvent(event.eventType);
            const color = getColorForEvent(event.eventType);
            const percentage = (event.count / maxCount) * 100;

            return (
              <div key={event.eventType} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {icon}
                    </span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {event.eventType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {event.uniqueUsers} users
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {event.count.toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Gem. {event.avgPerSession.toFixed(1)} per sessie
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
