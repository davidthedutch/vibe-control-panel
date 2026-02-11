'use client';

import { useState } from 'react';
import { Zap, Calendar, Shield, MessageCircle, Lock, Hash, UserPlus, LogIn, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import HomeScreen from './escal-screens/HomeScreen';
import EventDetailScreen from './escal-screens/EventDetailScreen';
import ArenaScreen from './escal-screens/ArenaScreen';
import ArsenalScreen from './escal-screens/ArsenalScreen';
import EscalchatScreen from './escal-screens/EscalchatScreen';
import VaultScreen from './escal-screens/VaultScreen';
import type { PreviewUser } from '../page';

type Tab = 'arena' | 'events' | 'arsenal' | 'escalchat' | 'vault';
type DeviceMode = 'iphone' | 'ipad';

type AuthScreen = 'login' | 'code' | 'register' | 'register-success';

interface EscalAppPreviewProps {
  device: DeviceMode;
  user: PreviewUser | null;
  onLogin: (user: PreviewUser) => void;
}

const DEVICE_DIMENSIONS = {
  iphone: { width: 375, height: 812 },
  ipad: { width: 768, height: 1024 },
};

export default function EscalAppPreview({ device, user, onLogin }: EscalAppPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('arena');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Auth state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regGeneratedCode, setRegGeneratedCode] = useState('');

  const dims = DEVICE_DIMENSIONS[device];

  const createUser = (username: string): PreviewUser => ({
    id: `user_${Date.now()}`,
    username,
    userCode: String(Math.floor(100000 + Math.random() * 900000)),
    level: 1,
    xp: 0,
    xpNext: 500,
    eventsAttended: 0,
    friends: 0,
    streak: 0,
    topGenre: 'Techno',
    venuesVisited: 0,
  });

  const handleLogin = () => {
    setLoginError('');
    if (!loginUsername.trim()) {
      setLoginError('Vul een gebruikersnaam in');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Vul een wachtwoord in');
      return;
    }
    if (loginPassword.length < 4) {
      setLoginError('Wachtwoord moet minimaal 4 tekens zijn');
      return;
    }
    onLogin(createUser(loginUsername.trim()));
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleCodeLogin = () => {
    setCodeError('');
    if (codeInput.length !== 6) {
      setCodeError('Voer een 6-cijferige code in');
      return;
    }
    // Demo: code 000000 is ongeldig, de rest werkt
    if (codeInput === '000000') {
      setCodeError('Ongeldige code, probeer opnieuw');
      return;
    }
    onLogin(createUser(`User${codeInput.slice(0, 3)}`));
    setCodeInput('');
  };

  const handleRegister = () => {
    setRegError('');
    if (!regUsername.trim()) {
      setRegError('Kies een gebruikersnaam');
      return;
    }
    if (regUsername.trim().length < 3) {
      setRegError('Gebruikersnaam moet minimaal 3 tekens zijn');
      return;
    }
    if (!regPassword.trim()) {
      setRegError('Kies een wachtwoord');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Wachtwoord moet minimaal 4 tekens zijn');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('Wachtwoorden komen niet overeen');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setRegGeneratedCode(code);
    setAuthScreen('register-success');
  };

  const handleRegisterComplete = () => {
    onLogin(createUser(regUsername.trim()));
    setRegUsername('');
    setRegPassword('');
    setRegPasswordConfirm('');
    setRegGeneratedCode('');
    setAuthScreen('login');
  };

  const resetAuth = () => {
    setAuthScreen('login');
    setLoginError('');
    setCodeError('');
    setRegError('');
  };

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
          <div
            className="scrollbar-hide overflow-y-auto bg-[#1A1D23] px-8 py-6"
            style={{ height: dims.height - 44 }}
          >
            {/* ====== LOGIN SCHERM ====== */}
            {authScreen === 'login' && (
              <div className="flex flex-col items-center gap-6 min-h-full justify-between">
                {/* Branding */}
                <div className="flex flex-col items-center gap-3 pt-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-white">Escalatie Guide</h1>
                    <p className="mt-1 text-xs text-slate-400">Veilig samen uit, veilig samen thuis</p>
                  </div>
                </div>

                {/* Login form */}
                <div className="flex w-full flex-col gap-3">
                  <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                    <label className="text-[10px] font-medium text-slate-400">Gebruikersnaam</label>
                    <input
                      type="text"
                      placeholder="bijv. DJFan"
                      className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                      value={loginUsername}
                      onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                    <label className="text-[10px] font-medium text-slate-400">Wachtwoord</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="text-slate-500">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <p className="text-[11px] text-red-400 text-center">{loginError}</p>
                  )}
                  <button
                    onClick={handleLogin}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Inloggen
                  </button>
                  <div className="flex items-center gap-3 my-1">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[10px] text-slate-500">of</span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                  <button
                    onClick={() => { setAuthScreen('code'); setCodeError(''); setCodeInput(''); }}
                    className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-white/[0.06] border border-white/[0.08] py-3 text-sm font-semibold text-slate-300 active:bg-white/[0.1] transition-colors"
                  >
                    <Hash className="h-4 w-4 text-orange-400" />
                    Inloggen met code
                  </button>
                </div>

                {/* Register */}
                <div className="flex flex-col items-center gap-3 pb-2">
                  <button
                    onClick={() => { setAuthScreen('register'); setRegError(''); setRegUsername(''); setRegPassword(''); setRegPasswordConfirm(''); }}
                    className="flex items-center gap-2 rounded-[16px] border border-orange-500/20 bg-orange-500/10 px-6 py-2.5 text-xs font-semibold text-orange-300 active:bg-orange-500/20 transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Account aanmaken
                  </button>
                  <p className="text-center text-[10px] text-slate-600 leading-relaxed">
                    Door in te loggen ga je akkoord met onze<br />
                    <span className="text-slate-400">Voorwaarden</span> en <span className="text-slate-400">Privacybeleid</span>
                  </p>
                </div>
              </div>
            )}

            {/* ====== CODE LOGIN SCHERM ====== */}
            {authScreen === 'code' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetAuth}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-300" />
                  </button>
                  <h2 className="text-base font-bold text-white">Inloggen met code</h2>
                </div>

                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15">
                    <Hash className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-center text-xs text-slate-400 leading-relaxed">
                    Voer je 6-cijferige persoonlijke code in<br />die je bij registratie hebt ontvangen
                  </p>
                </div>

                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-4">
                  <label className="text-[10px] font-medium text-slate-400">Persoonlijke code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="mt-2 w-full bg-transparent text-center text-2xl font-bold tracking-[0.5em] text-white placeholder-slate-700 outline-none"
                    value={codeInput}
                    onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCodeLogin()}
                  />
                </div>
                {codeError && (
                  <p className="text-[11px] text-red-400 text-center">{codeError}</p>
                )}
                <button
                  onClick={handleCodeLogin}
                  disabled={codeInput.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 disabled:opacity-30 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Inloggen
                </button>
                <p className="text-center text-[10px] text-slate-600">
                  Code kwijt? Vraag een nieuwe aan via<br />
                  <span className="text-orange-400">support@escal.nl</span>
                </p>
              </div>
            )}

            {/* ====== REGISTRATIE SCHERM ====== */}
            {authScreen === 'register' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetAuth}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-300" />
                  </button>
                  <h2 className="text-base font-bold text-white">Account aanmaken</h2>
                </div>

                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15">
                    <UserPlus className="h-7 w-7 text-orange-400" />
                  </div>
                  <p className="text-center text-[11px] text-slate-400">
                    Maak een account aan om Escal te gebruiken
                  </p>
                </div>

                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                  <label className="text-[10px] font-medium text-slate-400">Gebruikersnaam</label>
                  <input
                    type="text"
                    placeholder="Kies een naam (min. 3 tekens)"
                    className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    value={regUsername}
                    onChange={(e) => { setRegUsername(e.target.value); setRegError(''); }}
                  />
                </div>
                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                  <label className="text-[10px] font-medium text-slate-400">Wachtwoord</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 4 tekens"
                      className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setRegError(''); }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-slate-500">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="rounded-[16px] bg-white/[0.06] border border-white/[0.08] px-4 py-3">
                  <label className="text-[10px] font-medium text-slate-400">Bevestig wachtwoord</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Herhaal wachtwoord"
                    className="mt-1 w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                    value={regPasswordConfirm}
                    onChange={(e) => { setRegPasswordConfirm(e.target.value); setRegError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  />
                </div>
                {regError && (
                  <p className="text-[11px] text-red-400 text-center">{regError}</p>
                )}
                <button
                  onClick={handleRegister}
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Account aanmaken
                </button>
                <p className="text-center text-[10px] text-slate-600 leading-relaxed">
                  Door een account aan te maken ga je akkoord met onze<br />
                  <span className="text-slate-400">Voorwaarden</span> en <span className="text-slate-400">Privacybeleid</span>
                </p>
              </div>
            )}

            {/* ====== REGISTRATIE SUCCES ====== */}
            {authScreen === 'register-success' && (
              <div className="flex flex-col items-center gap-5 pt-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-white">Account aangemaakt!</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Welkom bij Escal, <span className="text-orange-300 font-semibold">{regUsername}</span>
                  </p>
                </div>

                <div className="w-full rounded-[16px] bg-orange-500/10 border border-orange-500/20 px-5 py-4 text-center">
                  <p className="text-[10px] font-medium text-slate-400 mb-1">Jouw persoonlijke code</p>
                  <p className="text-3xl font-bold tracking-[0.3em] text-orange-400">{regGeneratedCode}</p>
                  <p className="mt-2 text-[10px] text-slate-500">
                    Bewaar deze code goed! Je kunt hiermee<br />snel inloggen op elk apparaat.
                  </p>
                </div>

                <button
                  onClick={handleRegisterComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 active:bg-orange-600 transition-colors"
                >
                  Aan de slag
                </button>
              </div>
            )}
          </div>
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
