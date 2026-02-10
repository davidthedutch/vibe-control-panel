'use client';

import { useState } from 'react';
import { MessageCircle, Search, Send, Hash, Users, ChevronRight } from 'lucide-react';

const DEMO_ROOMS = [
  { id: 'public', label: 'Public', active: true },
  { id: 'awakenings', label: 'Awakenings NYE', active: false },
  { id: 'verknipt', label: 'Verknipt', active: false },
  { id: 'dgtl', label: 'DGTL', active: false },
];

const DEMO_PEOPLE = [
  { name: 'DJFan123', initials: 'DJ', online: true, code: '482910' },
  { name: 'TechnoLover', initials: 'TL', online: true, code: '731458' },
  { name: 'RaveQueen', initials: 'RQ', online: true, code: '204867' },
  { name: 'BassDrop', initials: 'BD', online: false, code: '965312' },
  { name: 'NightOwl', initials: 'NO', online: true, code: '148293' },
];

const DEMO_MESSAGES = [
  { id: '1', user: 'DJFan123', text: 'Wie staat er bij Main Stage?', time: '23:42' },
  { id: '2', user: 'TechnoLover', text: 'Charlotte de Witte is insane 🔥', time: '23:44' },
  { id: '3', user: 'RaveQueen', text: 'Bar 2 is het minst druk btw', time: '23:45' },
  { id: '4', user: 'NightOwl', text: 'Iemand oordopjes over? Ben de mijne kwijt', time: '23:47' },
  { id: '5', user: 'DJFan123', text: 'Bij de merch stand verkopen ze ze!', time: '23:48' },
];

import type { PreviewUser } from '../../page';

interface EscalchatScreenProps {
  user: PreviewUser;
}

export default function EscalchatScreen({ user }: EscalchatScreenProps) {
  const [activeRoom, setActiveRoom] = useState('public');
  const [messageText, setMessageText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalchat</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]"
        >
          <Search className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* Search by code */}
      {showSearch && (
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
          <p className="mb-2 text-[11px] font-medium text-slate-400">Zoek persoon op code</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-[12px] bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 flex-1">
              <Hash className="h-3 w-3 text-orange-400" />
              <input
                type="text"
                placeholder="6-cijferige code"
                maxLength={6}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button className="rounded-[12px] bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white">
              Zoek
            </button>
          </div>
        </div>
      )}

      {/* Room filter chips */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
        {DEMO_ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
              activeRoom === room.id
                ? 'bg-orange-500 text-white'
                : 'bg-white/[0.06] text-slate-400'
            }`}
          >
            <Hash className="h-3 w-3" />
            {room.label}
          </button>
        ))}
      </div>

      {/* People list */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Users className="h-3 w-3" />
            Online ({DEMO_PEOPLE.filter(p => p.online).length})
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {DEMO_PEOPLE.filter(p => p.online).map((person) => (
            <div key={person.name} className="flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                  {person.initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1A1D23] bg-green-400" />
              </div>
              <span className="text-[9px] text-slate-400 max-w-[48px] truncate">{person.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-1.5">
        {DEMO_MESSAGES.map((msg) => (
          <div key={msg.id} className="rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-orange-300">{msg.user}</span>
              <span className="text-[10px] text-slate-500">{msg.time}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="flex items-center gap-2 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2">
        <span className="text-[10px] font-medium text-orange-400 shrink-0">{user.username}</span>
        <input
          type="text"
          placeholder="Bericht versturen..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <Send className="h-4 w-4 text-orange-400" />
      </div>
    </div>
  );
}
