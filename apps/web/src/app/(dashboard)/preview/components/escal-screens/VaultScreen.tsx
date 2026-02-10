'use client';

import { useState } from 'react';
import { User, Star, Trophy, Calendar, Users, Settings, ChevronRight, ChevronDown, LogOut, Award, Flame, MapPin, Music, Zap, Heart, Shield, Share2, Copy, Check, X, Bell, Moon, Globe } from 'lucide-react';

const DEMO_FAVORITE_EVENTS = [
  { name: 'Awakenings NYE 2026', date: '31 dec 2026', venue: 'Gashouder' },
  { name: 'DGTL Festival', date: '11 apr 2026', venue: 'NDSM-werf' },
  { name: 'Verknipt Indoor', date: '15 mrt 2026', venue: 'Jaarbeurs' },
  { name: 'Soenda Festival', date: '6 jun 2026', venue: 'Ruigenhoek' },
];

const DEMO_FOLLOWED_DJS = [
  { name: 'Charlotte de Witte', genre: 'Techno', events: 3 },
  { name: 'Ben Klock', genre: 'Techno', events: 2 },
  { name: 'Amelie Lens', genre: 'Techno', events: 4 },
  { name: 'Jeff Mills', genre: 'Techno', events: 1 },
  { name: 'Nina Kraviz', genre: 'Techno / Electro', events: 2 },
];

const DEMO_NOODCONTACTEN = [
  { name: 'Sophie', relation: 'Zus', phone: '06-12345678' },
  { name: 'Mark', relation: 'Vriend', phone: '06-87654321' },
];

const DEMO_BADGES = [
  { name: 'First Timer', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', earned: true },
  { name: 'Festival Vet', icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-500/20', earned: true },
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

import type { PreviewUser } from '../../page';

interface VaultScreenProps {
  user: PreviewUser;
}

export default function VaultScreen({ user }: VaultScreenProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [notificaties, setNotificaties] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [taalNL, setTaalNL] = useState(true);

  const profile = {
    username: user.username,
    userCode: user.userCode,
    level: user.level,
    xp: user.xp,
    xpNext: user.xpNext,
    eventsAttended: user.eventsAttended,
    friends: user.friends,
    badges: 8,
    streak: user.streak,
    topGenre: user.topGenre,
    venuesVisited: user.venuesVisited,
  };

  const xpProgress = (profile.xp / profile.xpNext) * 100;
  const earnedBadges = DEMO_BADGES.filter(b => b.earned).length;

  const handleCopyCode = () => {
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Profile header */}
      <div className="flex flex-col items-center pt-2">
        <div className="relative mb-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A1D23] bg-orange-500 text-[10px] font-bold text-white">
            {profile.level}
          </div>
        </div>
        <h1 className="text-lg font-bold text-white">{profile.username}</h1>

        {/* 6-digit user code */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-orange-400">#{profile.userCode}</span>
          <button
            onClick={handleCopyCode}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
          >
            {codeCopied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400" />
            )}
          </button>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Deel je code zodat vrienden je kunnen vinden</p>

        <p className="mt-1 text-xs text-slate-400">Level {profile.level} &bull; {profile.topGenre} liefhebber</p>
        <div className="mt-2 flex gap-2">
          <button className="rounded-full bg-orange-500 px-4 py-1.5 text-[11px] font-semibold text-white">
            Profiel Bewerken
          </button>
          <button className="rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-1.5">
            <Share2 className="h-3.5 w-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* XP Progress */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-medium text-orange-300">
            <Star className="h-3 w-3" />
            XP Voortgang
          </span>
          <span className="text-[11px] text-slate-400">{profile.xp} / {profile.xpNext}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">{profile.xpNext - profile.xp} XP tot level {profile.level + 1}</p>
      </div>

      {/* Streak */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
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
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.eventsAttended}</p>
          <p className="text-[9px] text-slate-400">Events</p>
        </div>
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.friends}</p>
          <p className="text-[9px] text-slate-400">Vrienden</p>
        </div>
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-2.5 text-center">
          <p className="text-base font-bold text-white">{earnedBadges}</p>
          <p className="text-[9px] text-slate-400">Badges</p>
        </div>
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-2.5 text-center">
          <p className="text-base font-bold text-white">{profile.venuesVisited}</p>
          <p className="text-[9px] text-slate-400">Venues</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Badges</h2>
          <span className="text-[10px] text-orange-400">{earnedBadges}/{DEMO_BADGES.length}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_BADGES.map((badge) => (
            <div
              key={badge.name}
              className={`flex flex-col items-center gap-1 rounded-[20px] p-2.5 ${
                badge.earned ? `${badge.bg} backdrop-blur-xl border border-white/[0.08]` : 'bg-white/[0.03] opacity-40'
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
          <span className="text-[10px] text-orange-400">Alle {profile.friends}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {DEMO_FRIENDS.map((friend) => (
            <div key={friend.name} className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                  {friend.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1A1D23] ${
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
          <span className="text-[10px] text-orange-400">Alle {profile.eventsAttended}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {DEMO_EVENT_HISTORY.map((event) => (
            <div key={event.name} className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-200">{event.name}</p>
                <p className="text-[10px] text-slate-500">{event.venue} &bull; {event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1.5">
        {/* Favorieten */}
        <div>
          <button
            onClick={() => setExpandedMenu(expandedMenu === 'favorieten' ? null : 'favorieten')}
            className="flex w-full items-center gap-3 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-4 py-3 text-left active:bg-white/[0.1]"
          >
            <Heart className="h-5 w-5 text-red-400" />
            <span className="flex-1 text-sm font-medium text-slate-200">Favorieten</span>
            <span className="text-xs text-slate-500">{DEMO_FAVORITE_EVENTS.length}</span>
            {expandedMenu === 'favorieten' ? <ChevronDown className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
          </button>
          {expandedMenu === 'favorieten' && (
            <div className="mt-1 flex flex-col gap-1 pl-2">
              {DEMO_FAVORITE_EVENTS.map((ev) => (
                <div key={ev.name} className="flex items-center gap-2 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                  <Heart className="h-3 w-3 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{ev.name}</p>
                    <p className="text-[10px] text-slate-500">{ev.venue} &bull; {ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gevolgde DJ's */}
        <div>
          <button
            onClick={() => setExpandedMenu(expandedMenu === 'djs' ? null : 'djs')}
            className="flex w-full items-center gap-3 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-4 py-3 text-left active:bg-white/[0.1]"
          >
            <Music className="h-5 w-5 text-purple-400" />
            <span className="flex-1 text-sm font-medium text-slate-200">Gevolgde DJ&apos;s</span>
            <span className="text-xs text-slate-500">{DEMO_FOLLOWED_DJS.length}</span>
            {expandedMenu === 'djs' ? <ChevronDown className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
          </button>
          {expandedMenu === 'djs' && (
            <div className="mt-1 flex flex-col gap-1 pl-2">
              {DEMO_FOLLOWED_DJS.map((dj) => (
                <div key={dj.name} className="flex items-center gap-2 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-300">
                    {dj.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{dj.name}</p>
                    <p className="text-[10px] text-slate-500">{dj.genre} &bull; {dj.events} events</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Noodcontacten */}
        <div>
          <button
            onClick={() => setExpandedMenu(expandedMenu === 'nood' ? null : 'nood')}
            className="flex w-full items-center gap-3 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-4 py-3 text-left active:bg-white/[0.1]"
          >
            <Shield className="h-5 w-5 text-red-400" />
            <span className="flex-1 text-sm font-medium text-slate-200">Noodcontacten</span>
            <span className="text-xs text-slate-500">{DEMO_NOODCONTACTEN.length}</span>
            {expandedMenu === 'nood' ? <ChevronDown className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
          </button>
          {expandedMenu === 'nood' && (
            <div className="mt-1 flex flex-col gap-1 pl-2">
              {DEMO_NOODCONTACTEN.map((contact) => (
                <div key={contact.name} className="flex items-center gap-2 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold text-red-300">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200">{contact.name}</p>
                    <p className="text-[10px] text-slate-500">{contact.relation} &bull; {contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instellingen */}
        <div>
          <button
            onClick={() => setExpandedMenu(expandedMenu === 'settings' ? null : 'settings')}
            className="flex w-full items-center gap-3 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-4 py-3 text-left active:bg-white/[0.1]"
          >
            <Settings className="h-5 w-5 text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-200">Instellingen</span>
            {expandedMenu === 'settings' ? <ChevronDown className="h-4 w-4 text-slate-600" /> : <ChevronRight className="h-4 w-4 text-slate-600" />}
          </button>
          {expandedMenu === 'settings' && (
            <div className="mt-1 flex flex-col gap-1 pl-2">
              <button
                onClick={() => setNotificaties(!notificaties)}
                className="flex items-center gap-3 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2.5"
              >
                <Bell className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-xs text-slate-200 text-left">Notificaties</span>
                <div className={`h-5 w-9 rounded-full transition-colors ${notificaties ? 'bg-orange-500' : 'bg-slate-600'}`}>
                  <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${notificaties ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-3 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2.5"
              >
                <Moon className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-xs text-slate-200 text-left">Dark Mode</span>
                <div className={`h-5 w-9 rounded-full transition-colors ${darkMode ? 'bg-orange-500' : 'bg-slate-600'}`}>
                  <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
              <button
                onClick={() => setTaalNL(!taalNL)}
                className="flex items-center gap-3 rounded-[16px] bg-white/[0.04] border border-white/[0.06] px-3 py-2.5"
              >
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-xs text-slate-200 text-left">Taal</span>
                <span className="text-[10px] text-orange-400 font-medium">{taalNL ? 'Nederlands' : 'English'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button className="mt-1 flex items-center justify-center gap-2 rounded-[20px] py-3 text-sm font-medium text-red-400 active:bg-red-500/10">
        <LogOut className="h-4 w-4" />
        Uitloggen
      </button>
    </div>
  );
}
