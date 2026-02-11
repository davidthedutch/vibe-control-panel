'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, Hash, Users, ChevronDown, ChevronUp, UserCheck, UserPlus, UserMinus, ArrowLeft, Circle, X, MessageSquare, Lock, Plus } from 'lucide-react';
import { usePersistedState } from './use-persisted-state';
import type { PreviewUser } from '../../page';

const DEMO_ROOMS = [
  { id: 'public', label: 'Public' },
  { id: 'awakenings', label: 'Awakenings NYE' },
  { id: 'verknipt', label: 'Verknipt' },
  { id: 'dgtl', label: 'DGTL' },
];

const DEMO_PEOPLE = [
  { name: 'DJFan', initials: 'DJ', online: true, code: '482910' },
  { name: 'Techno', initials: 'TL', online: true, code: '731458' },
  { name: 'Rave', initials: 'RQ', online: true, code: '204867' },
  { name: 'Bass', initials: 'BD', online: false, code: '965312' },
  { name: 'Night', initials: 'NO', online: true, code: '148293' },
  { name: 'Flux', initials: 'FX', online: true, code: '557201' },
  { name: 'Echo', initials: 'EC', online: false, code: '883412' },
  { name: 'Venom', initials: 'VN', online: true, code: '224690' },
  { name: 'Pulse', initials: 'PL', online: false, code: '669823' },
  { name: 'Storm', initials: 'ST', online: true, code: '771034' },
];

const DEFAULT_FRIENDS = ['DJFan', 'Rave', 'Bass', 'Echo', 'Pulse'];

const DEFAULT_FRIEND_GROUPS = [
  { id: 'crew', name: 'Rave Crew', members: ['DJFan', 'Rave', 'Bass'] },
  { id: 'squad', name: 'Techno Squad', members: ['Echo', 'Pulse'] },
];

const INITIAL_ROOM_MESSAGES: Record<string, { id: string; user: string; text: string; time: string }[]> = {
  public: [
    { id: '1', user: 'DJFan', text: 'Wie staat er bij Main Stage?', time: '23:42' },
    { id: '2', user: 'Techno', text: 'Charlotte de Witte is insane', time: '23:44' },
    { id: '3', user: 'Rave', text: 'Bar 2 is het minst druk btw', time: '23:45' },
    { id: '4', user: 'Night', text: 'Iemand oordopjes over?', time: '23:47' },
    { id: '5', user: 'DJFan', text: 'Bij de merch stand verkopen ze ze!', time: '23:48' },
    { id: '9', user: 'Rave', text: 'Wie wil water delen?', time: '23:53' },
  ],
  awakenings: [
    { id: '6', user: 'Flux', text: 'Ben Klock gaat zo beginnen', time: '23:50' },
    { id: '7', user: 'Venom', text: 'Stage 2 is leeg, kom hierheen', time: '23:51' },
    { id: '12', user: 'Venom', text: 'Area V is beter dan verwacht', time: '23:57' },
  ],
  verknipt: [
    { id: '8', user: 'Storm', text: 'Geluid is hier echt top', time: '23:52' },
    { id: '11', user: 'Storm', text: 'Wat een set!', time: '23:56' },
  ],
  dgtl: [
    { id: '10', user: 'DJFan', text: 'Ik sta bij de speakers links', time: '23:55' },
    { id: '13', user: 'Flux', text: 'DGTL line-up is sterk dit jaar', time: '23:58' },
    { id: '14', user: 'Night', text: 'Iemand bij de waterbar?', time: '23:59' },
  ],
  crew: [
    { id: 'g1', user: 'DJFan', text: 'Zijn we er allemaal?', time: '22:30' },
    { id: 'g2', user: 'Rave', text: 'Ja bij de ingang!', time: '22:31' },
    { id: 'g3', user: 'Bass', text: 'Ik kom later rond 1 uur', time: '22:35' },
  ],
  squad: [
    { id: 'g4', user: 'Echo', text: 'Volgende keer Verknipt?', time: '20:00' },
    { id: 'g5', user: 'Pulse', text: 'Zeker weten!', time: '20:05' },
  ],
  'dm:DJFan': [
    { id: 'd1', user: 'DJFan', text: 'Yo waar sta je?', time: '23:30' },
    { id: 'd2', user: '__me__', text: 'Bij Main Stage links', time: '23:31' },
    { id: 'd3', user: 'DJFan', text: 'Nice ik kom eraan!', time: '23:32' },
  ],
  'dm:Rave': [
    { id: 'd4', user: 'Rave', text: 'Heb je water?', time: '23:20' },
    { id: 'd5', user: '__me__', text: 'Ja bij de bar gehaald', time: '23:21' },
  ],
  'dm:Bass': [
    { id: 'd6', user: '__me__', text: 'Ben je er al?', time: '22:50' },
    { id: 'd7', user: 'Bass', text: 'Nee kom later, rond 1 uur', time: '22:55' },
  ],
};

type FriendsChat = { type: 'group'; id: string } | { type: 'dm'; name: string };

interface EscalchatScreenProps {
  user: PreviewUser;
}

export default function EscalchatScreen({ user }: EscalchatScreenProps) {
  const [mode, setMode] = useState<'public' | 'friends'>('public');
  const [activeRoom, setActiveRoom] = useState('public');
  const [activeFriendsChat, setActiveFriendsChat] = useState<FriendsChat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = usePersistedState('escal-chat-all-messages', INITIAL_ROOM_MESSAGES);
  const [friendsList, setFriendsList] = usePersistedState<string[]>('escal-friends-list', DEFAULT_FRIENDS);
  const [friendGroups, setFriendGroups] = usePersistedState('escal-friend-groups', DEFAULT_FRIEND_GROUPS);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<typeof DEMO_PEOPLE[0] | null | 'not_found'>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createMode, setCreateMode] = useState<'menu' | 'group' | 'dm' | 'search'>('menu');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, activeRoom, activeFriendsChat]);

  const isFriend = (name: string) => friendsList.includes(name);

  const toggleFriend = (name: string) => {
    setFriendsList((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSendPublicMessage = () => {
    if (!messageText.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAllMessages((prev) => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), { id: String(Date.now()), user: user.username.slice(0, 7), text: messageText.trim(), time }],
    }));
    setMessageText('');
  };

  const handleSendFriendsMessage = () => {
    if (!messageText.trim() || !activeFriendsChat) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const key = activeFriendsChat.type === 'dm' ? `dm:${activeFriendsChat.name}` : activeFriendsChat.id;
    const msgUser = activeFriendsChat.type === 'dm' ? '__me__' : user.username.slice(0, 7);
    setAllMessages((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { id: String(Date.now()), user: msgUser, text: messageText.trim(), time }],
    }));
    setMessageText('');
  };

  const handleSearchCode = () => {
    if (searchCode.length !== 6) return;
    const found = DEMO_PEOPLE.find((p) => p.code === searchCode);
    setSearchResult(found ?? 'not_found');
  };

  const openDM = (name: string) => {
    setSelectedProfile(null);
    setMode('friends');
    setActiveFriendsChat({ type: 'dm', name });
  };

  const truncName = (name: string) => name.slice(0, 7);

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;
    const groupId = 'custom_' + Date.now();
    const newGroup = {
      id: groupId,
      name: newGroupName.trim(),
      members: selectedMembers,
    };
    setFriendGroups((prev) => [...prev, newGroup]);
    setAllMessages((prev) => ({ ...prev, [groupId]: [] }));
    setNewGroupName('');
    setSelectedMembers([]);
    setShowCreateMenu(false);
  };

  const toggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Combineer statische rooms + custom groepen
  const allRooms = [
    ...DEMO_ROOMS,
    ...friendGroups
      .filter((g) => g.id.startsWith('custom_'))
      .map((g) => ({ id: g.id, label: g.name })),
  ];

  const filteredPublicMessages = allMessages[activeRoom] || [];

  const dmConversations = friendsList
    .map((name) => {
      const msgs = allMessages[`dm:${name}`] || [];
      const lastMsg = msgs.slice(-1)[0];
      return { name, lastMsg, hasMessages: msgs.length > 0 };
    })
    .filter((dm) => dm.hasMessages);

  // Mini profile overlay
  const profilePerson = selectedProfile ? DEMO_PEOPLE.find((p) => p.name === selectedProfile) : null;
  const MiniProfile = profilePerson ? (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-[280px] rounded-[24px] bg-[#1E2128] border border-white/[0.1] shadow-2xl shadow-black/50 p-5 flex flex-col items-center gap-3 relative">
        <button
          onClick={() => setSelectedProfile(null)}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
        >
          <X className="h-3.5 w-3.5 text-slate-400" />
        </button>
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/25 text-lg font-bold text-orange-300">
            {profilePerson.initials}
          </div>
          {profilePerson.online && (
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-[3px] border-[#1E2128]" />
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-white">{profilePerson.name}</p>
          <p className="text-[11px] text-slate-400">#{profilePerson.code}</p>
          <p className={`mt-0.5 text-[10px] font-medium ${profilePerson.online ? 'text-green-400' : 'text-slate-500'}`}>
            {profilePerson.online ? 'Online' : 'Offline'}
          </p>
        </div>
        {isFriend(profilePerson.name) && (
          <div className="flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/20 px-2.5 py-0.5">
            <UserCheck className="h-3 w-3 text-green-400" />
            <span className="text-[10px] font-medium text-green-400">Vriend</span>
          </div>
        )}
        <div className="flex w-full gap-2 mt-1">
          <button
            onClick={() => toggleFriend(profilePerson.name)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-xs font-semibold transition-colors ${
              isFriend(profilePerson.name)
                ? 'bg-red-500/15 border border-red-500/20 text-red-400 active:bg-red-500/25'
                : 'bg-orange-500 text-white active:bg-orange-600'
            }`}
          >
            {isFriend(profilePerson.name) ? (
              <><UserMinus className="h-3.5 w-3.5" /> Verwijder</>
            ) : (
              <><UserPlus className="h-3.5 w-3.5" /> Toevoegen</>
            )}
          </button>
          {isFriend(profilePerson.name) && (
            <button
              onClick={() => openDM(profilePerson.name)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[16px] py-2.5 text-xs font-semibold bg-blue-500 text-white active:bg-blue-600"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Bericht
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  // Create Menu overlay
  const CreateMenu = showCreateMenu ? (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-[300px] rounded-[24px] bg-[#1E2128] border border-white/[0.1] shadow-2xl shadow-black/50 p-5 flex flex-col gap-3 relative">
        {createMode === 'menu' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Nieuw</h3>
              <button
                onClick={() => setShowCreateMenu(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
            <button
              onClick={() => setCreateMode('group')}
              className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-3 py-3 text-left active:bg-white/[0.1] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/15">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Nieuwe groep</p>
                <p className="text-[10px] text-slate-400">Maak een groepschat</p>
              </div>
            </button>
            <button
              onClick={() => setCreateMode('dm')}
              className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-3 py-3 text-left active:bg-white/[0.1] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15">
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Nieuw bericht</p>
                <p className="text-[10px] text-slate-400">Start een gesprek</p>
              </div>
            </button>
            <button
              onClick={() => setCreateMode('search')}
              className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-3 py-3 text-left active:bg-white/[0.1] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/15">
                <Search className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Zoek persoon</p>
                <p className="text-[10px] text-slate-400">Vind op 6-cijferige code</p>
              </div>
            </button>
          </>
        )}

        {createMode === 'group' && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateMode('menu')}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <h3 className="text-sm font-bold text-white">Nieuwe groep</h3>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-400">Groepsnaam</p>
              <input
                type="text"
                placeholder="Bijv. Rave Crew"
                className="w-full rounded-[12px] bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500/30"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-slate-400">Selecteer leden</p>
              <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                {[...DEMO_PEOPLE]
                  .sort((a, b) => {
                    const aFriend = friendsList.includes(a.name) ? 0 : 1;
                    const bFriend = friendsList.includes(b.name) ? 0 : 1;
                    return aFriend - bFriend;
                  })
                  .map((person) => {
                    const selected = selectedMembers.includes(person.name);
                    return (
                      <button
                        key={person.name}
                        onClick={() => toggleMember(person.name)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                          selected
                            ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                            : 'bg-white/[0.04] border border-white/[0.06] text-slate-400'
                        }`}
                      >
                        {selected && <UserCheck className="h-3 w-3" />}
                        {person.name}
                        {friendsList.includes(person.name) && !selected && (
                          <span className="text-green-400 text-[8px]">●</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || selectedMembers.length === 0}
              className="w-full rounded-[16px] bg-orange-500 py-2.5 text-xs font-semibold text-white active:bg-orange-600 disabled:opacity-30 disabled:active:bg-orange-500 transition-colors"
            >
              Maak groep{selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ''}
            </button>
          </>
        )}

        {createMode === 'dm' && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateMode('menu')}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <h3 className="text-sm font-bold text-white">Nieuw bericht</h3>
            </div>
            <p className="text-[10px] text-slate-400">Kies een vriend</p>
            <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto scrollbar-hide">
              {friendsList.length === 0 ? (
                <p className="text-center text-[11px] text-slate-500 py-4">Nog geen vrienden</p>
              ) : (
                friendsList.map((name) => {
                  const person = DEMO_PEOPLE.find((p) => p.name === name);
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setShowCreateMenu(false);
                        openDM(name);
                      }}
                      className="flex items-center gap-3 rounded-[12px] bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-left active:bg-white/[0.1] transition-colors"
                    >
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/25 text-[10px] font-bold text-orange-300">
                          {person?.initials || name.slice(0, 2)}
                        </div>
                        {person?.online && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border-[2px] border-[#1E2128]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white">{name}</p>
                        <p className={`text-[10px] ${person?.online ? 'text-green-400' : 'text-slate-500'}`}>
                          {person?.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <ArrowLeft className="h-3.5 w-3.5 text-slate-500 rotate-180" />
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {createMode === 'search' && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateMode('menu')}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <h3 className="text-sm font-bold text-white">Zoek persoon</h3>
            </div>
            <p className="text-[10px] text-slate-400">Zoek op 6-cijferige code</p>
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
              <p className="text-[11px] text-red-400">Geen persoon gevonden met code #{searchCode}</p>
            )}
            {searchResult && searchResult !== 'not_found' && (
              <button
                onClick={() => { setShowCreateMenu(false); setSelectedProfile(searchResult.name); }}
                className="w-full flex items-center gap-3 rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-left active:bg-white/[0.1]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                  {searchResult.initials}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-200">{searchResult.name}</p>
                  <p className="text-[10px] text-slate-500">#{searchResult.code} &bull; {searchResult.online ? 'Online' : 'Offline'}</p>
                </div>
                {isFriend(searchResult.name) ? (
                  <UserCheck className="h-4 w-4 text-green-400" />
                ) : (
                  <UserPlus className="h-4 w-4 text-slate-400" />
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  ) : null;

  // ====== FRIENDS: ACTIVE CHAT (group or DM) ======
  if (mode === 'friends' && activeFriendsChat) {
    const isDM = activeFriendsChat.type === 'dm';
    const chatKey = isDM ? `dm:${activeFriendsChat.name}` : activeFriendsChat.id;
    const chatMsgs = allMessages[chatKey] || [];

    let chatTitle = '';
    let chatSubtitle = '';
    if (isDM) {
      const person = DEMO_PEOPLE.find((p) => p.name === activeFriendsChat.name);
      chatTitle = activeFriendsChat.name;
      chatSubtitle = person?.online ? 'Online' : 'Offline';
    } else {
      const group = friendGroups.find((g) => g.id === activeFriendsChat.id);
      chatTitle = group?.name || activeFriendsChat.id;
      chatSubtitle = `${group?.members.length || 0} leden`;
    }

    return (
      <div className="relative flex flex-col gap-3 p-5">
        {MiniProfile}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveFriendsChat(null); setMessageText(''); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4 text-slate-300" />
          </button>
          {isDM ? (
            <button onClick={() => setSelectedProfile(activeFriendsChat.name)} className="flex items-center gap-2 flex-1">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/30 text-[10px] font-bold text-orange-300">
                  {DEMO_PEOPLE.find((p) => p.name === activeFriendsChat.name)?.initials || activeFriendsChat.name.slice(0, 2)}
                </div>
                {DEMO_PEOPLE.find((p) => p.name === activeFriendsChat.name)?.online && (
                  <div className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-green-400 border border-[#1A1D23]" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{chatTitle}</p>
                <p className="text-[10px] text-slate-500">{chatSubtitle}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{chatTitle}</p>
                <p className="text-[10px] text-slate-500">{chatSubtitle}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 flex flex-col overflow-hidden" style={{ minHeight: 320 }}>
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide" style={{ maxHeight: 400 }}>
            {chatMsgs.map((msg) => {
              const isOwn = isDM ? msg.user === '__me__' : msg.user === user.username.slice(0, 7);
              return (
                <div key={msg.id} className="py-0.5">
                  <p className="text-xs leading-relaxed">
                    <button
                      onClick={() => !isOwn && msg.user !== '__me__' && setSelectedProfile(msg.user)}
                      className={`font-semibold ${isOwn ? 'text-orange-400' : 'text-orange-300 active:underline'}`}
                    >
                      {isOwn ? 'Jij' : truncName(msg.user)}
                    </button>
                    <span className="text-slate-500 mx-1">&middot;</span>
                    <span className="text-slate-300">{msg.text}</span>
                    <span className="ml-1.5 text-[10px] text-slate-600">{msg.time}</span>
                  </p>
                </div>
              );
            })}
            {chatMsgs.length === 0 && (
              <p className="text-center text-[11px] text-slate-500 py-8">Nog geen berichten</p>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-white/[0.08] px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Bericht..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendFriendsMessage()}
            />
            <button onClick={handleSendFriendsMessage} className="active:scale-90 transition-transform">
              <Send className={`h-4 w-4 ${messageText.trim() ? 'text-orange-400' : 'text-slate-600'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== MAIN VIEW ======
  return (
    <div className="relative flex flex-col gap-3 p-5">
      {MiniProfile}
      {CreateMenu}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Escalatiekamer</h1>
      </div>

      {/* Mode toggle — Public / Friends + Plus */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] p-0.5">
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
        <button
          onClick={() => { setShowCreateMenu(true); setCreateMode('menu'); setSearchCode(''); setSearchResult(null); }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* ====== PUBLIC MODE ====== */}
      {mode === 'public' && (
        <>
          {/* Room filter chips */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-0.5">
            {allRooms.map((room) => (
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
              {filteredPublicMessages.map((msg) => {
                const isOwn = msg.user === user.username.slice(0, 7);
                return (
                  <div key={msg.id} className="py-0.5">
                    <p className="text-xs leading-relaxed">
                      <button
                        onClick={() => !isOwn && setSelectedProfile(msg.user)}
                        className={`font-semibold ${isOwn ? 'text-orange-400' : 'text-orange-300 active:underline'}`}
                      >
                        {isOwn ? 'Jij' : truncName(msg.user)}
                      </button>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSendPublicMessage()}
              />
              <button onClick={handleSendPublicMessage} className="active:scale-90 transition-transform">
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
                  <button
                    key={person.name}
                    onClick={() => setSelectedProfile(person.name)}
                    className={`flex items-center gap-1.5 rounded-full px-2 py-1 active:scale-95 transition-transform ${
                      isFriend(person.name)
                        ? 'bg-green-500/10 border border-green-500/15'
                        : 'bg-white/[0.04] border border-white/[0.06]'
                    }`}
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ====== FRIENDS MODE ====== */}
      {mode === 'friends' && (
        <div className="flex flex-col gap-4">
          {/* Friend Groups */}
          {friendGroups.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                <Users className="h-3 w-3" /> Vriendengroepen
              </h2>
              <div className="flex flex-col gap-1.5">
                {friendGroups.map((group) => {
                  const msgs = allMessages[group.id] || [];
                  const lastMsg = msgs.slice(-1)[0];
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveFriendsChat({ type: 'group', id: group.id })}
                      className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2.5 text-left active:bg-white/[0.1] transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/15">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{group.name}</span>
                          {lastMsg && <span className="text-[10px] text-slate-600">{lastMsg.time}</span>}
                        </div>
                        {lastMsg ? (
                          <p className="truncate text-[10px] text-slate-400 mt-0.5">
                            {lastMsg.user === '__me__' ? 'Jij' : lastMsg.user}: {lastMsg.text}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 mt-0.5">{group.members.length} leden</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Private Messages */}
          <div>
            <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
              <Lock className="h-3 w-3" /> Priveberichten
            </h2>
            {dmConversations.length === 0 ? (
              <div className="rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] p-4 text-center">
                <p className="text-[11px] text-slate-500">Nog geen priveberichten</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {dmConversations.map((dm) => {
                  const person = DEMO_PEOPLE.find((p) => p.name === dm.name);
                  const unread = dm.lastMsg && dm.lastMsg.user !== '__me__';
                  return (
                    <button
                      key={dm.name}
                      onClick={() => setActiveFriendsChat({ type: 'dm', name: dm.name })}
                      className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-3 py-2.5 text-left active:bg-white/[0.1] transition-colors"
                    >
                      <div className="relative">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/25 text-[10px] font-bold text-orange-300">
                          {person?.initials || dm.name.slice(0, 2)}
                        </div>
                        {person?.online && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border-[2px] border-[#1A1D23]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{dm.name}</span>
                          {dm.lastMsg && <span className="text-[10px] text-slate-600">{dm.lastMsg.time}</span>}
                        </div>
                        {dm.lastMsg && (
                          <p className="truncate text-[10px] text-slate-400 mt-0.5">
                            {dm.lastMsg.user === '__me__' ? 'Jij: ' : ''}{dm.lastMsg.text}
                          </p>
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
        </div>
      )}
    </div>
  );
}
