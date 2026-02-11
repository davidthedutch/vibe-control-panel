'use client';

import { useState } from 'react';
import { Zap, Calendar, Shield, MessageCircle, Lock, Hash, UserPlus, LogIn } from 'lucide-react';
import HomeScreen from './escal-screens/HomeScreen';
import EventDetailScreen from './escal-screens/EventDetailScreen';
import ArenaScreen from './escal-screens/ArenaScreen';
import ArsenalScreen from './escal-screens/ArsenalScreen';
import EscalchatScreen from './escal-screens/EscalchatScreen';
import VaultScreen from './escal-screens/VaultScreen';
import type { PreviewUser } from '../page';

type Tab = 'arena' | 'events' | 'arsenal' | 'escalchat' | 'vault';
type DeviceMode = 'iphone' | 'ipad';

interface EscalAppPreviewProps {
  device: DeviceMode;
  user: PreviewUser | null;
}

const DEVICE_DIMENSIONS = {
  iphone: { width: 375, height: 812 },
  ipad: { width: 768, height: 1024 },
};

export default function EscalAppPreview({ device, user }: EscalAppPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('arena');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const dims = DEVICE_DIMENSIONS[device];

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleBackFromEvent = () => {
    setSelectedEventId(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedEventId(null);
  };

  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'arena', label: 'Arena', icon: Zap },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'arsenal', label: 'Arsenal', icon: Shield },
    { id: 'escalchat', label: 'Escal', icon: MessageCircle },
    { id: 'vault', label: 'Vault', icon: Lock },
  ];

  const renderScreen = () => {
    if (!user) return null;

    if (activeTab === 'events' && selectedEventId) {
      return <EventDetailScreen eventId={selectedEventId} onBack={handleBackFromEvent} user={user} />;
    }

    switch (activeTab) {
      case 'arena':
        return <ArenaScreen user={user} />;
      case 'events':
        return <HomeScreen onSelectEvent={handleSelectEvent} />;
      case 'arsenal':
        return <ArsenalScreen />;
      case 'escalchat':
        return <EscalchatScreen user={user} />;
      case 'vault':
        return <VaultScreen user={user} />;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {/* Phone/Tablet frame */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-slate-600 bg-[#1A1D23] shadow-2xl shadow-black/50"
        style={{ width: dims.width, height: dims.height }}
      >
        {/* Status bar */}
        <div className="relative z-10 flex h-11 items-center justify-between bg-[#1A1D23] px-6">
          <span className="text-xs font-semibold text-white">
            {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {/* Notch / Dynamic Island */}
          {device === 'iphone' && (
            <div className="absolute left-1/2 top-0 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />
          )}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2.5 rounded-sm ${i <= 3 ? 'bg-white' : 'bg-slate-600'}`} style={{ width: 3 }} />
              ))}
            </div>
            <span className="ml-1 text-[10px] text-white">5G</span>
            <div className="ml-1 h-3 w-5 rounded-sm border border-white/50 p-px">
              <div className="h-full w-3/4 rounded-sm bg-green-400" />
            </div>
          </div>
        </div>

        {user === null ? (
          <>
            {/* Login screen */}
            <div
              className="flex flex-col items-center justify-between bg-[#1A1D23] px-8 py-10"
              style={{ height: dims.height - 44 }}
            >
              {/* Top: branding */}
              <div className="flex flex-col items-center gap-3 pt-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white">Escalatie Guide</h1>
                  <p className="mt-1 text-xs text-slate-400">Veilig samen uit, veilig samen thuis</p>
                </div>
              </div>

              {/* Middle: login form */}
              <div className="flex w-full flex-col gap-3">
                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                  <label className="text-[10px] font-medium text-slate-400">Gebruikersnaam</label>
                  <input
                    type="text"
                    placeholder="bijv. DJFan"
                    className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    readOnly
                  />
                </div>
                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                  <label className="text-[10px] font-medium text-slate-400">Wachtwoord</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    readOnly
                  />
                </div>
                <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20">
                  <LogIn className="h-4 w-4" />
                  Inloggen
                </button>
                <div className="flex items-center gap-3 my-1">
                  <div className="h-px flex-1 bg-white/[0.08]" />
                  <span className="text-[10px] text-slate-500">of</span>
                  <div className="h-px flex-1 bg-white/[0.08]" />
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-white/[0.06] border border-white/[0.08] py-3 text-sm font-semibold text-slate-300">
                  <Hash className="h-4 w-4 text-orange-400" />
                  Inloggen met code
                </button>
              </div>

              {/* Bottom: register */}
              <div className="flex flex-col items-center gap-3 pb-4">
                <button className="flex items-center gap-2 rounded-[16px] border border-orange-500/20 bg-orange-500/10 px-6 py-2.5 text-xs font-semibold text-orange-300">
                  <UserPlus className="h-3.5 w-3.5" />
                  Account aanmaken
                </button>
                <p className="text-center text-[10px] text-slate-600 leading-relaxed">
                  Door in te loggen ga je akkoord met onze<br />
                  <span className="text-slate-400">Voorwaarden</span> en <span className="text-slate-400">Privacybeleid</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* App content - scrollable */}
            <div
              className="scrollbar-hide overflow-y-auto overflow-x-hidden bg-[#1A1D23]"
              style={{ height: dims.height - 44 - 56 }}
            >
              {renderScreen()}
            </div>

            {/* Bottom tab bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.08] bg-[#1A1D23]/95 backdrop-blur-lg">
              <div className="flex items-center justify-around px-2 pb-4 pt-1.5">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className="flex flex-col items-center gap-0.5 px-3 py-1"
                    >
                      <tab.icon
                        className={`h-4 w-4 ${isActive ? 'text-orange-400' : 'text-slate-500'}`}
                      />
                      <span
                        className={`text-[9px] font-medium ${
                          isActive ? 'text-orange-400' : 'text-slate-500'
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Home indicator */}
              <div className="flex justify-center pb-1">
                <div className="h-1 w-32 rounded-full bg-slate-600" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
