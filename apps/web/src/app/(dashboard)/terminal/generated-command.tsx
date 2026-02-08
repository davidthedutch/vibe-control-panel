'use client';

import { useState } from 'react';
import { Copy, Check, Pencil, Play } from 'lucide-react';

interface GeneratedCommandProps {
  command: string;
  onExecute: (command: string) => void;
  onDismiss: () => void;
}

export default function GeneratedCommand({
  command,
  onExecute,
  onDismiss,
}: GeneratedCommandProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedCommand, setEditedCommand] = useState(command);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(editing ? editedCommand : command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  function handleExecute() {
    onExecute(editing ? editedCommand : command);
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <span className="text-xs font-medium text-slate-400">
          Gegenereerd commando
        </span>
        <button
          onClick={onDismiss}
          className="text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          Sluiten
        </button>
      </div>

      {/* Command display */}
      <div className="p-4">
        {editing ? (
          <textarea
            value={editedCommand}
            onChange={(e) => setEditedCommand(e.target.value)}
            className="w-full rounded border border-slate-600 bg-gray-950 p-3 font-mono text-sm text-green-400 outline-none focus:border-indigo-500"
            rows={3}
            spellCheck={false}
          />
        ) : (
          <pre className="overflow-x-auto rounded bg-gray-950 p-3 font-mono text-sm text-green-400">
            <code>{command}</code>
          </pre>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 border-t border-slate-700 px-4 py-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              Gekopieerd
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Kopieer
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (!editing) setEditedCommand(command);
            setEditing(!editing);
          }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? 'Annuleer' : 'Bewerk'}
        </button>

        <div className="flex-1" />

        <button
          onClick={handleExecute}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Play className="h-3.5 w-3.5" />
          Uitvoeren
        </button>
      </div>
    </div>
  );
}
