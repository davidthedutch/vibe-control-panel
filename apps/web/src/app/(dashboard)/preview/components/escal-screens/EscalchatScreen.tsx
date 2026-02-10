'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, Hash, Users, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import type { PreviewUser } from '../../page';

const DEMO_ROOMS = [
  { id: 'public', label: 'Public' },
  { id: 'awakenings', label: 'Awakenings NYE' },
  { id: 'verknipt', label: 'Verknipt' },
  { id: 'dgtl', label: 'DGTL' },
];

const DEMO_PEOPLE = [
  { name: 'DJFan', initials: 'DJ', online: true, code: '482910', friend: true },
  { name: 'Techno', initials: 'TL', online: true, code: '731458', friend: false },
  { name: 'Rave', initials: 'RQ', online: true, code: '204867', friend: true },
  { name: 'Bass', initials: 'BD', online: false, code: '965312', friend: true },
  { name: 'Night', initials: 'NO', online: true, code: '148293', friend: false },
  { name: 'Flux', initials: 'FX', online: true, code: '557201', friend: false },
  { name: 'Echo', initials: 'EC', online: false, code: '883412', friend: true },
  { name: 'Venom', initials: 'VN', online: true, code: '224690', friend: false },
  { name: 'Pulse', initials: 'PL', online: false, code: '669823', friend: true },
  { name: 'Storm', initials: 'ST', online: true, code: '771034', friend: false },
];

const INITIAL_MESSAGES = [
  { id: '1', user: 'DJFan', text: 'Wie staat er bij Main Stage?', time: '23:42', room: 'public' },
  { id: '2', user: 'Techno', text: 'Charlotte de Witte is insane', time: '23:44', room: 'public' },
  { id: '3', user: 'Rave', text: 'Bar 2 is het minst druk btw', time: '23:45', room: 'public' },
  { id: '4', user: 'Night', text: 'Iemand oordopjes over?', time: '23:47', room: 'public' },
  { id: '5', user: 'DJFan', text: 'Bij de merch stand verkopen ze ze!', time: '23:48', room: 'public' },
  { id: '6', user: 'Flux', text: 'Ben Klock gaat zo beginnen', time: '23:50', room: 'awakenings' },
  { id: '7', user: 'Venom', text: 'Stage 2 is leeg, kom hierheen', time: '23:51', room: 'awakenings' },
  { id: '8', user: 'Storm', text: 'Geluid is hier echt top', time: '23:52', room: 'verknipt' },
  { id: '9', user: 'Rave', text: 'Wie wil water delen?', time: '23:53', room: 'public' },
  { id: '10', user: 'DJFan', text: 'Ik sta bij de speakers links', time: '23:55', room: 'dgtl' },
  { id: '11', user: 'Storm', text: 'Wat een set!', time: '23:56', room: 'verknipt' },
  { id: '12', user: 'Venom', text: 'Area V is beter dan verwacht', time: '23:57', room: 'awakenings' },
  { id: '13', user: 'Flux', text: 'DGTL line-up is sterk dit jaar', time: '23:58', room: 'dgtl' },
  { id: '14', user: 'Night', text: 'Iemand bij de waterbar?', time: '23:59', room: 'dgtl' },
];

interface EscalchatScreenProps {
  user: PreviewUser;
}

const STORAGE_KEY = 'escal-chat-messages';

function loadMessages() {
  if (typeof window === 'undefined') return INITIAL_MESSAGES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return INITIAL_MESSAGES;
}

export default function EscalchatScreen({ user }: EscalchatScreenProps) {
  const [activeRoom, setActiveRoom] = useState('public');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [showSearch, setShowSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<typeof DEMO_PEOPLE[0] | null | 'not_found'>(null);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'friends'>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load persisted messages on mount
  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  // Persist messages to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), user: user.username.slice(0, 7), text: messageText.trim(), time, room: activeRoom },
    ]);
    setMessageText('');
  };

  const handleSearchCode = () => {
    if (searchCode.length !== 6) return;
    const found = DEMO_PEOPLE.find((p) => p.code === searchCode);
    setSearchResult(found ?? 'not_found');
  };

  const truncName = (name: string) => name.slice(0, 7);

  const filteredMessages = messages.filter((msg) => msg.room === activeRoom);

  const filteredPeople = userFilter === 'friends'
    ? DEMO_PEOPLE.filter((p) => p.friend)
    : DEMO_PEOPLE;

  return (
    <div className="flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalchat</h1>
        <button
          onClick={() => { setShowSearch(!showSearch); setSearchResult(null); setSearchCode(''); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xl border border-white/[0.08] ${
            showSearch ? 'bg-orange-500/20' : 'bg-white/[0.06]'
          }`}
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
                onChange={(e) => { setSearchCode(e.target.value.replace(/\D/g, '')); setSearchResult(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchCode()}
              />
            </div>
            <button
              onClick={handleSearchCode}
              className="rounded-[12px] bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white active:bg-orange-600"
            >
              Zoek
            </button>
          </div>
          {searchResult === 'not_found' && (
            <p className="mt-2 text-[11px] text-red-400">Geen persoon gevonden met code #{searchCode}</p>
          )}
          {searchResult && searchResult !== 'not_found' && (
            <div className="mt-2 flex items-center gap-3 rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                {searchResult.initials}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-200">{searchResult.name}</p>
                <p className="text-[10px] text-slate-500">#{searchResult.code} &bull; {searchResult.online ? 'Online' : 'Offline'}</p>
              </div>
              <UserCheck className="h-4 w-4 text-green-400" />
            </div>
          )}
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

      {/* Chat block - one big container */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 flex flex-col overflow-hidden" style={{ minHeight: 200 }}>
        <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide" style={{ maxHeight: 280 }}>
          {filteredMessages.map((msg) => {
            const isOwn = msg.user === user.username.slice(0, 7);
            return (
              <div key={msg.id} className="py-0.5">
                <p className="text-xs leading-relaxed">
                  <span className={`font-semibold ${isOwn ? 'text-orange-400' : 'text-orange-300'}`}>
                    {isOwn ? 'Jij' : truncName(msg.user)}
                  </span>
                  <span className="text-slate-500 mx-1">·</span>
                  <span className="text-slate-300">{msg.text}</span>
                  <span className="ml-1.5 text-[10px] text-slate-600">{msg.time}</span>
                </p>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input inside the block */}
        <div className="border-t border-white/[0.08] px-3 py-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Bericht..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="active:scale-90 transition-transform">
            <Send className={`h-4 w-4 ${messageText.trim() ? 'text-orange-400' : 'text-slate-600'}`} />
          </button>
        </div>
      </div>

      {/* Online users block - collapsed by default, shows ~2 lines */}
      <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 overflow-hidden">
        {/* Header with expand toggle */}
        <button
          onClick={() => setUsersExpanded(!usersExpanded)}
          className="w-full flex items-center justify-between px-3 py-2"
        >
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Users className="h-3 w-3" />
            Online ({DEMO_PEOPLE.filter(p => p.online).length + 1})
          </h3>
          {usersExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          )}
        </button>

        {/* Filter tabs */}
        <div className="flex gap-1 px-3 pb-2">
          {(['all', 'friends'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setUserFilter(filter)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                userFilter === filter
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/[0.06] text-slate-500'
              }`}
            >
              {filter === 'all' ? 'All' : 'Friends'}
            </button>
          ))}
        </div>

        {/* Users grid - collapsed shows 2 rows (~8 users), expanded shows all */}
        <div
          className="px-3 pb-3 overflow-hidden transition-all duration-200"
          style={{ maxHeight: usersExpanded ? 500 : 72 }}
        >
          <div className="flex flex-wrap gap-2">
            {/* Current user always first */}
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/20 px-2 py-1">
              <div className="relative">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/50 text-[8px] font-bold text-white">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-px -right-px h-1.5 w-1.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[10px] text-orange-400 font-medium">Jij</span>
            </div>
            {filteredPeople.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-1"
              >
                <div className="relative">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-[8px] font-bold text-orange-300">
                    {person.initials}
                  </div>
                  {person.online && (
                    <div className="absolute -bottom-px -right-px h-1.5 w-1.5 rounded-full bg-green-400" />
                  )}
                </div>
                <span className={`text-[10px] ${person.online ? 'text-slate-300' : 'text-slate-600'}`}>
                  {person.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
