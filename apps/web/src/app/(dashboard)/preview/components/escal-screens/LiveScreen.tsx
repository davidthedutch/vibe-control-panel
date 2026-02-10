'use client';

import { MapPin, MessageCircle, Shield, Users, Radio, AlertTriangle } from 'lucide-react';
import { useLiveLocations, useRadiusMessages, useBuddyPairs } from '@/lib/hooks/use-escal-data';

export default function LiveScreen() {
  const { locations, loading: locsLoading } = useLiveLocations();
  const { messages, loading: msgsLoading } = useRadiusMessages();
  const { pairs, loading: pairsLoading } = useBuddyPairs();

  const activePairs = pairs.filter((p) => p.status === 'active');
  const alertPairs = pairs.filter((p) => p.status === 'alert');

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold text-white">Live</h1>

      {/* Live stats bar */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2">
          <div className="relative">
            <Radio className="h-4 w-4 text-green-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-400">{locsLoading ? '...' : locations.length}</p>
            <p className="text-[10px] text-slate-400">Live users</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2">
          <MessageCircle className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-sm font-bold text-blue-400">{msgsLoading ? '...' : messages.length}</p>
            <p className="text-[10px] text-slate-400">Berichten</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-orange-500/10 px-3 py-2">
          <Shield className="h-4 w-4 text-orange-400" />
          <div>
            <p className="text-sm font-bold text-orange-400">{pairsLoading ? '...' : activePairs.length}</p>
            <p className="text-[10px] text-slate-400">Buddy&apos;s</p>
          </div>
        </div>
      </div>

      {/* Fake map area */}
      <div className="relative h-36 overflow-hidden rounded-xl bg-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-800/50" />
        {/* Map pins */}
        {!locsLoading && locations.slice(0, 8).map((loc, i) => (
          <div
            key={loc.id}
            className="absolute"
            style={{
              left: `${15 + (i * 10) % 70}%`,
              top: `${15 + ((i * 17) % 60)}%`,
            }}
          >
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />
            </div>
          </div>
        ))}
        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 backdrop-blur-sm">
          <p className="text-[10px] text-slate-300">Amsterdam &bull; Live Map</p>
        </div>
      </div>

      {/* Radius Chat */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <MessageCircle className="h-4 w-4 text-blue-400" />
          Radius Chat
        </h2>
        <div className="flex flex-col gap-1.5">
          {msgsLoading ? (
            <div className="h-16 animate-pulse rounded-lg bg-slate-800/80" />
          ) : (
            messages.slice(0, 4).map((msg) => (
              <div key={msg.id} className="rounded-lg bg-slate-800/60 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-300">{msg.username}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-300">{msg.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Buddy Pairs */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Shield className="h-4 w-4 text-orange-400" />
          Buddy System
          {alertPairs.length > 0 && (
            <span className="flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {alertPairs.length} alert
            </span>
          )}
        </h2>
        <div className="flex flex-col gap-1.5">
          {pairsLoading ? (
            <div className="h-12 animate-pulse rounded-lg bg-slate-800/80" />
          ) : (
            pairs.slice(0, 4).map((pair) => (
              <div key={pair.id} className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                <div className={`h-2 w-2 rounded-full ${
                  pair.status === 'active' ? 'bg-green-400' :
                  pair.status === 'alert' ? 'bg-red-400 animate-pulse' : 'bg-slate-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {pair.user_name} &amp; {pair.buddy_name}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">{pair.event_title}</p>
                </div>
                <span className={`text-[10px] font-medium ${
                  pair.status === 'active' ? 'text-green-400' :
                  pair.status === 'alert' ? 'text-red-400' : 'text-slate-500'
                }`}>
                  {pair.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
