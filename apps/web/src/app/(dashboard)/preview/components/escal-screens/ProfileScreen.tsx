'use client';

import { User, Star, Trophy, Calendar, Users, Settings, ChevronRight, LogOut } from 'lucide-react';

export default function ProfileScreen() {
  // Mock profile data
  const profile = {
    username: 'DemoUser',
    level: 12,
    xp: 2450,
    xpNext: 3000,
    eventsAttended: 34,
    friends: 67,
    badges: 8,
  };

  const xpProgress = (profile.xp / profile.xpNext) * 100;

  const menuItems = [
    { icon: Calendar, label: 'Mijn Events', count: profile.eventsAttended },
    { icon: Users, label: 'Vrienden', count: profile.friends },
    { icon: Trophy, label: 'Badges', count: profile.badges },
    { icon: Settings, label: 'Instellingen', count: null },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Profile header */}
      <div className="flex flex-col items-center pt-4">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-purple-500 text-[10px] font-bold text-white">
            {profile.level}
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">{profile.username}</h1>
        <p className="text-xs text-slate-400">Level {profile.level}</p>
      </div>

      {/* XP Progress */}
      <div className="rounded-xl bg-slate-800/80 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-medium text-purple-300">
            <Star className="h-3 w-3" />
            XP Voortgang
          </span>
          <span className="text-[11px] text-slate-400">{profile.xp} / {profile.xpNext}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">{profile.xpNext - profile.xp} XP tot level {profile.level + 1}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-800/80 p-3 text-center">
          <p className="text-lg font-bold text-white">{profile.eventsAttended}</p>
          <p className="text-[10px] text-slate-400">Events</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-3 text-center">
          <p className="text-lg font-bold text-white">{profile.friends}</p>
          <p className="text-[10px] text-slate-400">Vrienden</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-3 text-center">
          <p className="text-lg font-bold text-white">{profile.badges}</p>
          <p className="text-[10px] text-slate-400">Badges</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 text-left active:bg-slate-700/50"
          >
            <item.icon className="h-5 w-5 text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-200">{item.label}</span>
            {item.count !== null && (
              <span className="text-xs text-slate-500">{item.count}</span>
            )}
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-red-400 active:bg-red-500/10">
        <LogOut className="h-4 w-4" />
        Uitloggen
      </button>
    </div>
  );
}
