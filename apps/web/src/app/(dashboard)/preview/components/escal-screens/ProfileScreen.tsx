'use client';

import { User, Star, Trophy, Calendar, Users, Settings, ChevronRight, LogOut, Award, Flame, MapPin, Music, Zap, Heart, Shield, Share2 } from 'lucide-react';

const DEMO_BADGES = [
  { name: 'First Timer', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', earned: true },
  { name: 'Festival Vet', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/20', earned: true },
  { name: 'Techno Master', icon: Music, color: 'text-blue-400', bg: 'bg-blue-500/20', earned: true },
  { name: 'Social Butterfly', icon: Users, color: 'text-green-400', bg: 'bg-green-500/20', earned: true },
  { name: 'Night Owl', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/20', earned: true },
  { name: 'Venue Collector', icon: MapPin, color: 'text-pink-400', bg: 'bg-pink-500/20', earned: false },
  { name: 'Buddy Guardian', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-500/20', earned: true },
  { name: 'Early Adopter', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/20', earned: true },
  { name: 'Hardcore Fan', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/20', earned: false },
];

const DEMO_FRIENDS = [
  { name: 'DJFan123', level: 15, status: 'online' },
  { name: 'TechnoLover', level: 22, status: 'online' },
  { name: 'RaveQueen', level: 8, status: 'offline' },
  { name: 'BassDrop', level: 19, status: 'offline' },
  { name: 'NightOwl', level: 11, status: 'online' },
];

const DEMO_EVENT_HISTORY = [
  { name: 'Awakenings NYE', date: '31 dec 2025', venue: 'Gashouder' },
  { name: 'DGTL Festival', date: '12 apr 2025', venue: 'NDSM-werf' },
  { name: 'Verknipt', date: '8 mrt 2025', venue: 'Jaarbeurs' },
];

export default function ProfileScreen() {
  const profile = {
    username: 'DemoUser',
    level: 12,
    xp: 2450,
    xpNext: 3000,
    eventsAttended: 34,
    friends: 67,
    badges: 8,
    streak: 5,
    topGenre: 'Techno',
    venuesVisited: 15,
  };

  const xpProgress = (profile.xp / profile.xpNext) * 100;
  const earnedBadges = DEMO_BADGES.filter(b => b.earned).length;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Profile header */}
      <div className="flex flex-col items-center pt-2">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-purple-500 text-[10px] font-bold text-white">
            {profile.level}
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">{profile.username}</h1>
        <p className="text-xs text-slate-400">Level {profile.level} &bull; {profile.topGenre} liefhebber</p>
        <div className="mt-2 flex gap-2">
          <button className="rounded-full bg-purple-500 px-4 py-1.5 text-[11px] font-semibold text-white">
            Profiel Bewerken
          </button>
          <button className="rounded-full bg-slate-700 px-3 py-1.5">
            <Share2 className="h-3.5 w-3.5 text-slate-300" />
          </button>
        </div>
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

      {/* Streak */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">{profile.streak} weekenden streak!</span>
          </div>
          <span className="text-[10px] text-slate-400">x{profile.streak} XP multiplier</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.eventsAttended}</p>
          <p className="text-[9px] text-slate-400">Events</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.friends}</p>
          <p className="text-[9px] text-slate-400">Vrienden</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-center">
          <p className="text-base font-bold text-white">{earnedBadges}</p>
          <p className="text-[9px] text-slate-400">Badges</p>
        </div>
        <div className="rounded-xl bg-slate-800/80 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.venuesVisited}</p>
          <p className="text-[9px] text-slate-400">Venues</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Badges</h2>
          <span className="text-[10px] text-purple-400">{earnedBadges}/{DEMO_BADGES.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_BADGES.map((badge) => (
            <div
              key={badge.name}
              className={`flex flex-col items-center gap-1 rounded-xl p-2.5 ${
                badge.earned ? badge.bg : 'bg-slate-800/40 opacity-40'
              }`}
            >
              <badge.icon className={`h-5 w-5 ${badge.earned ? badge.color : 'text-slate-600'}`} />
              <span className={`text-center text-[9px] font-medium ${badge.earned ? 'text-slate-200' : 'text-slate-500'}`}>
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Preview */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Vrienden</h2>
          <span className="text-[10px] text-purple-400">Alle {profile.friends}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {DEMO_FRIENDS.map((friend) => (
            <div key={friend.name} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/30 text-[10px] font-bold text-purple-300">
                  {friend.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-800 ${
                  friend.status === 'online' ? 'bg-green-400' : 'bg-slate-500'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-200">{friend.name}</p>
                <p className="text-[10px] text-slate-500">Level {friend.level}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Event History */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Event Geschiedenis</h2>
          <span className="text-[10px] text-purple-400">Alle {profile.eventsAttended}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {DEMO_EVENT_HISTORY.map((event) => (
            <div key={event.name} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-200">{event.name}</p>
                <p className="text-[10px] text-slate-500">{event.venue} &bull; {event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        {[
          { icon: Heart, label: 'Favorieten', count: 12 },
          { icon: Music, label: 'Gevolgde DJ\'s', count: 8 },
          { icon: Shield, label: 'Noodcontacten', count: 2 },
          { icon: Settings, label: 'Instellingen', count: null },
        ].map((item) => (
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
      <button className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-red-400 active:bg-red-500/10">
        <LogOut className="h-4 w-4" />
        Uitloggen
      </button>
    </div>
  );
}
