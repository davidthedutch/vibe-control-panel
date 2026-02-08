'use client';

import { useState } from 'react';
import { Play, FlaskConical, Hammer, Scan, Sparkles, ChevronDown } from 'lucide-react';
import GeneratedCommand from './generated-command';

type AIModel = 'Claude Opus 4.6' | 'Claude Sonnet 4.5';

interface PromptInputProps {
  onExecuteCommand: (command: string) => void;
}

const QUICK_ACTIONS = [
  { label: 'Run dev server', icon: Play, command: 'pnpm dev' },
  { label: 'Run tests', icon: FlaskConical, command: 'pnpm test' },
  { label: 'Build', icon: Hammer, command: 'pnpm build' },
  { label: 'Scan components', icon: Scan, command: 'claude "Scan alle componenten en update SITE_MANIFEST.json"' },
] as const;

export default function PromptInput({ onExecuteCommand }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('Claude Opus 4.6');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState<string | null>(null);

  function handleGeneratePrompt() {
    if (!prompt.trim()) return;
    const command = `claude --model ${selectedModel === 'Claude Opus 4.6' ? 'opus' : 'sonnet'} "${prompt.trim()}"`;
    setGeneratedCommand(command);
  }

  function handleExecute() {
    if (!prompt.trim()) return;
    const command = `claude --model ${selectedModel === 'Claude Opus 4.6' ? 'opus' : 'sonnet'} "${prompt.trim()}"`;
    onExecuteCommand(command);
    setPrompt('');
    setGeneratedCommand(null);
  }

  function handleExecuteGenerated(command: string) {
    onExecuteCommand(command);
    setPrompt('');
    setGeneratedCommand(null);
  }

  function handleQuickAction(command: string) {
    onExecuteCommand(command);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGeneratePrompt();
    }
  }

  return (
    <div className="space-y-3">
      {/* Prompt input area */}
      <div className="relative rounded-lg border border-slate-700 bg-slate-900 transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Beschrijf wat je wilt wijzigen..."
          className="w-full resize-none rounded-t-lg bg-transparent p-4 text-sm text-slate-200 outline-none placeholder:text-slate-500"
          rows={3}
          spellCheck={false}
        />

        {/* Bottom bar with model selector and buttons */}
        <div className="flex items-center gap-2 border-t border-slate-800 px-3 py-2">
          {/* AI Model selector */}
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              {selectedModel}
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {modelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setModelDropdownOpen(false)}
                />
                <div className="absolute bottom-full left-0 z-20 mb-1 w-48 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
                  {(['Claude Opus 4.6', 'Claude Sonnet 4.5'] as AIModel[]).map(
                    (model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setModelDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-700 ${
                          selectedModel === model
                            ? 'text-indigo-400'
                            : 'text-slate-300'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {model}
                        {selectedModel === model && (
                          <span className="ml-auto text-indigo-400">&#10003;</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <button
            onClick={handleGeneratePrompt}
            disabled={!prompt.trim()}
            className="rounded-md bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Genereer prompt
          </button>

          <button
            onClick={handleExecute}
            disabled={!prompt.trim()}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Uitvoeren
          </button>
        </div>
      </div>

      {/* Generated command */}
      {generatedCommand && (
        <GeneratedCommand
          command={generatedCommand}
          onExecute={handleExecuteGenerated}
          onDismiss={() => setGeneratedCommand(null)}
        />
      )}

      {/* Quick action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Snelacties:</span>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.command)}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
