'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, Hash, Users, ChevronDown, ChevronUp, UserCheck, ArrowLeft, Circle } from 'lucide-react';
import { usePersistedState } from './use-persisted-state';
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

const FRIENDS = DEMO_PEOPLE.filter((p) => p.friend);

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

const INITIAL_DM_MESSAGES: Record<string, { id: string; user: string; text: string; time: string }[]> = {
  DJFan: [
    { id: 'd1', user: 'DJFan', text: 'Yo waar sta je?', time: '23:30' },
    { id: 'd2', user: '__me__', text: 'Bij Main Stage links', time: '23:31' },
    { id: 'd3', user: 'DJFan', text: 'Nice ik kom eraan!', time: '23:32' },
  ],
  Rave: [
    { id: 'd4', user: 'Rave', text: 'Heb je water?', time: '23:20' },
    { id: 'd5', user: '__me__', text: 'Ja bij de bar gehaald', time: '23:21' },
  ],
  Bass: [
    { id: 'd6', user: '__me__', text: 'Ben je er al?', time: '22:50' },
    { id: 'd7', user: 'Bass', text: 'Nee kom later, rond 1 uur', time: '22:55' },
  ],
  Echo: [
    { id: 'd8', user: 'Echo', text: 'Volgende keer weer!', time: '20:00' },
  ],
  Pulse: [
    { id: 'd9', user: 'Pulse', text: 'Laat weten als je er bent', time: '21:30' },
    { id: 'd10', user: '__me__', text: 'Ben binnen!', time: '23:00' },
  ],
};

interface EscalchatScreenProps {
  user: PreviewUser;
}

export default function EscalchatScreen({ user }: EscalchatScreenProps) {
  const [mode, setMode] = useState<'public' | 'friends'>('public');
  const [activeRoom, setActiveRoom] = useState('public');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = usePersistedState('escal-chat-messages', INITIAL_MESSAGES);
  const [dmMessages, setDmMessages] = usePersistedState('escal-dm-messages', INITIAL_DM_MESSAGES);
  const [showSearch, setShowSearch] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<typeof DEMO_PEOPLE[0] | null | 'not_found'>(null);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [dmText, setDmText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dmEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  useEffect(() => {
    dmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages, activeDM]);

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

  const handleSendDM = () => {
    if (!dmText.trim() || !activeDM) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setDmMessages((prev) => ({
      ...prev,
      [activeDM]: [...(prev[activeDM] || []), { id: String(Date.now()), user: '__me__', text: dmText.trim(), time }],
    }));
    setDmText('');
  };

  const handleSearchCode = () => {
    if (searchCode.length !== 6) return;
    const found = DEMO_PEOPLE.find((p) => p.code === searchCode);
    setSearchResult(found ?? 'not_found');
  };

  const truncName = (name: string) => name.slice(0, 7);
  const filteredMessages = messages.filter((msg) => msg.room === activeRoom);

  // Friends DM view
  if (mode === 'friends' && activeDM) {
    const friend = FRIENDS.find((f) => f.name === activeDM);
    const friendMsgs = dmMessages[activeDM] || [];
    return (
      <div className="flex flex-col gap-3 p-5">
        {/* DM Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveDM(null); setDmText(''); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                {friend?.initials || activeDM.slice(0, 2)}
              </div>
              {friend?.online && (
                <div className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-green-400 border border-[#1A1D23]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{activeDM}</p>
              <p className="text-[10px] text-slate-500">{friend?.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        {/* DM Chat block */}
        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 flex flex-col overflow-hidden" style={{ minHeight: 300 }}>
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide" style={{ maxHeight: 380 }}>
            {friendMsgs.map((msg) => {
              const isOwn = msg.user === '__me__';
              return (
                <div key={msg.id} className="py-0.5">
                  <p className="text-xs leading-relaxed">
                    <span className={`font-semibold ${isOwn ? 'text-orange-400' : 'text-orange-300'}`}>
                      {isOwn ? 'Jij' : truncName(msg.user)}
                    </span>
                    <span className="text-slate-500 mx-1">&middot;</span>
                    <span className="text-slate-300">{msg.text}</span>
                    <span className="ml-1.5 text-[10px] text-slate-600">{msg.time}</span>
                  </p>
                </div>
              );
            })}
            <div ref={dmEndRef} />
          </div>
          <div className="border-t border-white/[0.08] px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Bericht..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
            />
            <button onClick={handleSendDM} className="active:scale-90 transition-transform">
              <Send className={`h-4 w-4 ${dmText.trim() ? 'text-orange-400' : 'text-slate-600'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalatiekamer</h1>
        <button
          onClick={() => { setShowSearch(!showSearch); setSearchResult(null); setSearchCode(''); }}
          className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-xl border border-white/[0.08] ${
            showSearch ? 'bg-orange-500/20' : 'bg-white/[0.06]'
          }`}
        >
          <Search className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* Mode toggle — Public / Friends */}
      <div className="flex rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] p-0.5">
        {(['public', 'friends'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
              mode === m
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400'
            }`}
          >
            {m === 'public' ? 'Public' : 'Friends'}
          </button>
        ))}
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

      {/* ====== PUBLIC MODE ====== */}
      {mode === 'public' && (
        <>
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

          {/* Chat block */}
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
                      <span className="text-slate-500 mx-1">&middot;</span>
                      <span className="text-slate-300">{msg.text}</span>
                      <span className="ml-1.5 text-[10px] text-slate-600">{msg.time}</span>
                    </p>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
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

          {/* Online users block */}
          <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 overflow-hidden">
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
            <div
              className="px-3 pb-3 overflow-hidden transition-all duration-200"
              style={{ maxHeight: usersExpanded ? 500 : 72 }}
            >
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-orange-500/15 border border-orange-500/20 px-2 py-1">
                  <div className="relative">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/50 text-[8px] font-bold text-white">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-px -right-px h-1.5 w-1.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-orange-400 font-medium">Jij</span>
                </div>
                {DEMO_PEOPLE.map((person) => (
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
        </>
      )}

      {/* ====== FRIENDS MODE ====== */}
      {mode === 'friends' && (
        <div className="flex flex-col gap-2">
          {FRIENDS.map((friend) => {
            const lastMsg = (dmMessages[friend.name] || []).slice(-1)[0];
            const unread = friend.online && lastMsg && lastMsg.user !== '__me__';
            return (
              <button
                key={friend.name}
                onClick={() => setActiveDM(friend.name)}
                className="flex items-center gap-3 rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 px-3 py-3 text-left active:bg-white/[0.1] transition-colors"
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/25 text-xs font-bold text-orange-300">
                    {friend.initials}
                  </div>
                  {friend.online && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#1A1D23]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{friend.name}</span>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-500">{lastMsg.time}</span>
                    )}
                  </div>
                  {lastMsg ? (
                    <p className="truncate text-[11px] text-slate-400 mt-0.5">
                      {lastMsg.user === '__me__' ? 'Jij: ' : ''}{lastMsg.text}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-0.5">Geen berichten</p>
                  )}
                </div>
                {unread && (
                  <Circle className="h-2.5 w-2.5 text-orange-400 shrink-0" fill="currentColor" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
