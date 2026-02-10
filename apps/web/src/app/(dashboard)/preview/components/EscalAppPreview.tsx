'use client';

import { useState } from 'react';
import { Calendar, Radio, User } from 'lucide-react';
import HomeScreen from './escal-screens/HomeScreen';
import EventDetailScreen from './escal-screens/EventDetailScreen';
import LiveScreen from './escal-screens/LiveScreen';
import ProfileScreen from './escal-screens/ProfileScreen';

type Tab = 'home' | 'live' | 'profile';
type DeviceMode = 'iphone' | 'ipad';

interface EscalAppPreviewProps {
  device: DeviceMode;
}

const DEVICE_DIMENSIONS = {
  iphone: { width: 375, height: 812 },
  ipad: { width: 768, height: 1024 },
};

export default function EscalAppPreview({ device }: EscalAppPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
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
    { id: 'home', label: 'Events', icon: Calendar },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'profile', label: 'Profiel', icon: User },
  ];

  const renderScreen = () => {
    if (activeTab === 'home' && selectedEventId) {
      return <EventDetailScreen eventId={selectedEventId} onBack={handleBackFromEvent} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onSelectEvent={handleSelectEvent} />;
      case 'live':
        return <LiveScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {/* Phone/Tablet frame */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-slate-600 bg-slate-900 shadow-2xl shadow-black/50"
        style={{ width: dims.width, height: dims.height }}
      >
        {/* Status bar */}
        <div className="relative z-10 flex h-11 items-center justify-between bg-slate-900 px-6">
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

        {/* App content - scrollable */}
        <div
          className="overflow-y-auto overflow-x-hidden bg-slate-900"
          style={{ height: dims.height - 44 - 56 }}
        >
          {renderScreen()}
        </div>

        {/* Bottom tab bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-lg">
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
                    className={`h-5 w-5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`}
                  />
                  <span
                    className={`text-[10px] font-medium ${
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
      </div>
    </div>
  );
}
