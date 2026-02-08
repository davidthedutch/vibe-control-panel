'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventTracking from '../event-tracking';
import CustomEvents from '../custom-events';
import FunnelBuilder from '../funnel-builder';
import AnalyticsSnippet from '../analytics-snippet';
import { fetchEventTracking, type EventData } from '@/lib/analytics';
import { Loader2 } from 'lucide-react';

// TODO: Get project ID from context/params
const PROJECT_ID = '00000000-0000-0000-0000-000000000001';

export default function AdvancedAnalyticsPage() {
  const [range, setRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const eventsData = await fetchEventTracking(PROJECT_ID, range);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [range]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Geavanceerde Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Events, funnels en custom tracking configureren
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {[
            { label: 'Laatste 7 dagen', value: 7 },
            { label: 'Laatste 30 dagen', value: 30 },
            { label: 'Laatste 90 dagen', value: 90 },
          ].map((dr) => (
            <button
              key={dr.value}
              onClick={() => setRange(dr.value)}
              disabled={loading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                range === dr.value
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="events">Event Tracking</TabsTrigger>
          <TabsTrigger value="custom">Custom Events</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="integration">Integratie</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <EventTracking events={events} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <CustomEvents projectId={PROJECT_ID} />
        </TabsContent>

        <TabsContent value="funnels" className="mt-6">
          <FunnelBuilder projectId={PROJECT_ID} range={range} />
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <AnalyticsSnippet projectId={PROJECT_ID} projectName="Vibe Control Panel" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
