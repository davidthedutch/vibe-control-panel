'use client';

import { useEffect, useRef, useState } from 'react';
import type { Terminal as XTermTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
  wsUrl?: string;
}

export default function TerminalView({ wsUrl = 'ws://localhost:3001' }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermTerminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initTerminal() {
      if (!terminalRef.current) return;

      try {
        // Dynamically import xterm modules (client-side only)
        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');
        const { WebLinksAddon } = await import('@xterm/addon-web-links');

        if (!mounted) return;

        // Create terminal instance
        const term = new Terminal({
          cursorBlink: true,
          fontSize: 13,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: {
            background: '#0a0a0b',
            foreground: '#e2e8f0',
            cursor: '#3b82f6',
            black: '#1e293b',
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#eab308',
            blue: '#3b82f6',
            magenta: '#a855f7',
            cyan: '#06b6d4',
            white: '#cbd5e1',
            brightBlack: '#475569',
            brightRed: '#f87171',
            brightGreen: '#4ade80',
            brightYellow: '#facc15',
            brightBlue: '#60a5fa',
            brightMagenta: '#c084fc',
            brightCyan: '#22d3ee',
            brightWhite: '#f1f5f9',
          },
          convertEol: true,
          scrollback: 1000,
          allowProposedApi: true,
        });

        // Create and load addons
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);

        // Open terminal in container
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Display welcome message
        term.writeln('\x1b[1;36m╭───────────────────────────────────────────────────────────╮\x1b[0m');
        term.writeln('\x1b[1;36m│\x1b[0m  \x1b[1;33mVibe Control Panel Terminal\x1b[0m                           \x1b[1;36m│\x1b[0m');
        term.writeln('\x1b[1;36m│\x1b[0m  Connecting to terminal server...                      \x1b[1;36m│\x1b[0m');
        term.writeln('\x1b[1;36m╰───────────────────────────────────────────────────────────╯\x1b[0m');
        term.writeln('');

        // Connect to WebSocket server
        connectWebSocket(term);

        // Handle resize
        const handleResize = () => {
          if (fitAddon && mounted) {
            fitAddon.fit();
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'resize',
                cols: term.cols,
                rows: term.rows,
              }));
            }
          }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
          mounted = false;
          window.removeEventListener('resize', handleResize);
          if (wsRef.current) {
            wsRef.current.close();
          }
          term.dispose();
        };
      } catch (err) {
        console.error('Failed to initialize terminal:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize terminal');
      }
    }

    function connectWebSocket(term: XTermTerminal) {
      setConnectionStatus('connecting');

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          console.log('[Terminal] WebSocket connected');
          setConnectionStatus('connected');
          setError(null);

          // Create terminal session
          ws.send(JSON.stringify({
            type: 'create',
            cols: term.cols,
            rows: term.rows,
            cwd: process.cwd(),
          }));

          // Send input from terminal to server
          term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'input', data }));
            }
          });
        };

        ws.onmessage = (event) => {
          if (!mounted) return;

          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case 'created':
                console.log('[Terminal] Session created:', message.terminalId);
                break;
              case 'output':
                term.write(message.data);
                break;
              case 'exit':
                term.writeln('');
                term.writeln(`\x1b[1;33mProcess exited with code ${message.exitCode}\x1b[0m`);
                break;
              case 'error':
                term.writeln('');
                term.writeln(`\x1b[1;31mError: ${message.message}\x1b[0m`);
                break;
            }
          } catch (err) {
            console.error('[Terminal] Failed to parse message:', err);
          }
        };

        ws.onerror = (event) => {
          console.error('[Terminal] WebSocket error:', event);
          setError('Connection error. Make sure terminal server is running.');
          setConnectionStatus('disconnected');
        };

        ws.onclose = () => {
          if (!mounted) return;
          console.log('[Terminal] WebSocket closed');
          setConnectionStatus('disconnected');
          term.writeln('');
          term.writeln('\x1b[1;31m╭───────────────────────────────────────────────────────────╮\x1b[0m');
          term.writeln('\x1b[1;31m│\x1b[0m  \x1b[1;33mConnection closed\x1b[0m                                     \x1b[1;31m│\x1b[0m');
          term.writeln('\x1b[1;31m│\x1b[0m  Start the terminal server with:                       \x1b[1;31m│\x1b[0m');
          term.writeln('\x1b[1;31m│\x1b[0m  \x1b[1;36mnode terminal-server.js\x1b[0m                              \x1b[1;31m│\x1b[0m');
          term.writeln('\x1b[1;31m╰───────────────────────────────────────────────────────────╯\x1b[0m');

          // Attempt to reconnect after 5 seconds
          if (mounted) {
            setTimeout(() => {
              if (mounted && wsRef.current?.readyState !== WebSocket.OPEN) {
                term.writeln('');
                term.writeln('\x1b[1;33mAttempting to reconnect...\x1b[0m');
                connectWebSocket(term);
              }
            }, 5000);
          }
        };
      } catch (err) {
        console.error('[Terminal] Failed to create WebSocket:', err);
        setError('Failed to connect to terminal server');
        setConnectionStatus('disconnected');
      }
    }

    initTerminal();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [wsUrl]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-gray-950">
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-slate-500 font-mono">
          claude-code ~ vibe-project
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-xs text-slate-500">
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-900/50 bg-red-950/50 px-4 py-2">
          <p className="text-xs text-red-400">{error}</p>
          <p className="text-xs text-slate-500 mt-1">
            Start the terminal server: <code className="text-yellow-400">node terminal-server.js</code>
          </p>
        </div>
      )}

      {/* Terminal container */}
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  );
}
