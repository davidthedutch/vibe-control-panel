'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Code } from 'lucide-react';

interface CustomEvent {
  id: string;
  name: string;
  description: string;
  properties: string[];
}

interface CustomEventsProps {
  projectId: string;
}

export default function CustomEvents({ projectId }: CustomEventsProps) {
  const [events, setEvents] = useState<CustomEvent[]>([
    {
      id: '1',
      name: 'button_clicked',
      description: 'Wanneer een gebruiker op een button klikt',
      properties: ['button_text', 'button_id', 'page_url'],
    },
    {
      id: '2',
      name: 'form_submitted',
      description: 'Wanneer een formulier wordt verstuurd',
      properties: ['form_name', 'form_fields', 'success'],
    },
  ]);

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [showCode, setShowCode] = useState<string | null>(null);

  function handleAddEvent() {
    if (!newEventName.trim()) return;

    const newEvent: CustomEvent = {
      id: Date.now().toString(),
      name: newEventName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: newEventDescription.trim(),
      properties: [],
    };

    setEvents([...events, newEvent]);
    setNewEventName('');
    setNewEventDescription('');
    setIsAddingEvent(false);
  }

  function handleDeleteEvent(id: string) {
    setEvents(events.filter(e => e.id !== id));
  }

  function generateCodeSnippet(event: CustomEvent): string {
    const propertiesObj = event.properties.reduce((acc, prop) => {
      acc[prop] = `'value'`;
      return acc;
    }, {} as Record<string, string>);

    const propertiesStr = Object.entries(propertiesObj)
      .map(([key, value]) => `    ${key}: ${value}`)
      .join(',\n');

    return `// Track custom event: ${event.name}
vibeAnalytics.track('${event.name}', {
${propertiesStr}
});`;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Custom Events
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Definieer en track custom events voor jouw applicatie
          </p>
        </div>
        <button
          onClick={() => setIsAddingEvent(!isAddingEvent)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Nieuw Event
        </button>
      </div>

      {isAddingEvent && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Event Naam
              </label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="bijv. product_viewed"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Beschrijving
              </label>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Wanneer wordt dit event getriggerd?"
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Save className="h-3.5 w-3.5" />
                Opslaan
              </button>
              <button
                onClick={() => {
                  setIsAddingEvent(false);
                  setNewEventName('');
                  setNewEventDescription('');
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {event.name}
                    </code>
                    {event.properties.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        {event.properties.length} properties
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {event.description}
                    </p>
                  )}
                  {event.properties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.properties.map((prop) => (
                        <span
                          key={prop}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700 dark:bg-slate-700/50 dark:text-slate-300"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCode(showCode === event.id ? null : event.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    title="Bekijk code"
                  >
                    <Code className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Verwijder event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showCode === event.id && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-900 p-4 dark:border-slate-700">
                <pre className="overflow-x-auto text-xs text-slate-100">
                  <code>{generateCodeSnippet(event)}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && !isAddingEvent && (
        <div className="py-8 text-center">
          <Code className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Geen custom events gedefinieerd
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Klik op &quot;Nieuw Event&quot; om te beginnen
          </p>
        </div>
      )}
    </div>
  );
}
