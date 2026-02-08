'use client';

import { useState, useCallback, useRef } from 'react';
import { Terminal, GripVertical } from 'lucide-react';
import TerminalView from './terminal-view';
import PromptInput from './prompt-input';
import PromptHistory from './prompt-history';
import { parseTerminalOutput } from './output-parser';

// --- Demo data ---

interface PromptHistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial';
  model: string;
  components: string[];
  filesChanged: string[];
}

const DEMO_PROMPT_HISTORY: PromptHistoryEntry[] = [
  {
    id: '1',
    prompt: 'Maak een responsive header met logo links en navigatie rechts',
    timestamp: '14:23',
    status: 'success',
    model: 'Claude Opus 4.6',
    components: ['Header', 'Navigation'],
    filesChanged: ['Header.tsx', 'Navigation.tsx'],
  },
  {
    id: '2',
    prompt: 'Voeg een hero sectie toe met grote titel, subtitel en blauwe CTA knop',
    timestamp: '14:30',
    status: 'success',
    model: 'Claude Opus 4.6',
    components: ['HeroSection'],
    filesChanged: ['HeroSection.tsx'],
  },
  {
    id: '3',
    prompt: 'Maak een contact formulier met validatie',
    timestamp: '15:10',
    status: 'success',
    model: 'Claude Opus 4.6',
    components: ['ContactForm'],
    filesChanged: ['ContactForm.tsx'],
  },
];

// --- Page component ---

export default function TerminalPage() {
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>(DEMO_PROMPT_HISTORY);
  const [splitPercent, setSplitPercent] = useState(60);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'error' | 'warning' | 'success'; message: string }>>([]);

  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  function getCurrentTimestamp(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const addNotification = useCallback((type: 'error' | 'warning' | 'success', message: string) => {
    const id = String(Date.now());
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  function handleExecuteCommand(command: string) {
    const ts = getCurrentTimestamp();

    // If it's a claude command, add to prompt history
    const claudeMatch = command.match(/^claude\s+(?:--model\s+(\w+)\s+)?"(.+)"$/);
    if (claudeMatch) {
      const model = claudeMatch[1];
      const prompt = claudeMatch[2];

      const newEntry: PromptHistoryEntry = {
        id: String(Date.now()),
        prompt,
        timestamp: ts,
        status: 'success',
        model: model === 'sonnet' ? 'Claude Sonnet 4.5' : 'Claude Opus 4.6',
        components: [],
        filesChanged: [],
      };

      setPromptHistory((prev) => [newEntry, ...prev].slice(0, 20)); // Keep last 20
    }

    // Send command through WebSocket if available
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'input',
        data: command + '\r'
      }));
    }
  }

  function handleRepeatPrompt(prompt: string) {
    handleExecuteCommand(`claude "${prompt}"`);
  }

  // Monitor terminal output for errors
  const handleTerminalOutput = useCallback((output: string) => {
    const parsed = parseTerminalOutput(output);

    if (parsed.hasError) {
      addNotification('error', parsed.errorMessage || 'Command failed');
    } else if (parsed.hasWarning) {
      addNotification('warning', parsed.warningMessage || 'Warning detected');
    }
  }, [addNotification]);

  // --- Resize logic ---

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(moveEvent: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const percent = Math.min(Math.max((x / rect.width) * 100, 30), 80);
      setSplitPercent(percent);
    }

    function onMouseUp() {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
          <Terminal className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Terminal + Claude Code
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Voer AI-prompts uit en bekijk de resultaten in real-time
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border px-4 py-3 shadow-lg ${
                notification.type === 'error'
                  ? 'border-red-700 bg-red-950/90 text-red-200'
                  : notification.type === 'warning'
                  ? 'border-yellow-700 bg-yellow-950/90 text-yellow-200'
                  : 'border-green-700 bg-green-950/90 text-green-200'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Split layout */}
      <div ref={containerRef} className="flex min-h-0 flex-1 gap-0">
        {/* Left panel: Terminal + Prompt input */}
        <div
          className="flex flex-col gap-3 overflow-hidden pr-0"
          style={{ width: `${splitPercent}%` }}
        >
          {/* Prompt input (above terminal) */}
          <PromptInput onExecuteCommand={handleExecuteCommand} />

          {/* Terminal view */}
          <TerminalView />
        </div>

        {/* Resize handle */}
        <div
          className="group flex w-4 shrink-0 cursor-col-resize items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="flex h-8 w-4 items-center justify-center rounded transition-colors group-hover:bg-slate-700">
            <GripVertical className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-400" />
          </div>
        </div>

        {/* Right panel: Prompt history */}
        <div
          className="min-w-0 overflow-hidden"
          style={{ width: `${100 - splitPercent}%` }}
        >
          <PromptHistory
            entries={promptHistory}
            onRepeat={handleRepeatPrompt}
          />
        </div>
      </div>
    </div>
  );
}
