const { WebSocketServer } = require('ws');
const http = require('http');

// Try to use node-pty if available, otherwise use child_process
let pty;
let useNodePty = false;

try {
  pty = require('node-pty');
  useNodePty = true;
  console.log('[Terminal Server] Using node-pty for native terminal');
} catch (e) {
  console.log('[Terminal Server] node-pty not available, using child_process');
  pty = require('child_process');
}

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store active terminal sessions
const terminals = new Map();
let terminalIdCounter = 0;

wss.on('connection', (ws) => {
  const terminalId = ++terminalIdCounter;
  console.log(`[Terminal Server] Client connected: Terminal ${terminalId}`);

  let term = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'create') {
        // Create new terminal session
        const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
        const cols = data.cols || 80;
        const rows = data.rows || 24;
        const cwd = data.cwd || process.cwd();

        if (useNodePty) {
          // Use node-pty for full terminal emulation
          term = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols,
            rows,
            cwd,
            env: process.env,
          });

          term.onData((data) => {
            try {
              ws.send(JSON.stringify({ type: 'output', data }));
            } catch (e) {
              console.error('[Terminal Server] Error sending data:', e.message);
            }
          });

          term.onExit(({ exitCode }) => {
            console.log(`[Terminal Server] Terminal ${terminalId} exited with code ${exitCode}`);
            ws.send(JSON.stringify({ type: 'exit', exitCode }));
          });

          terminals.set(terminalId, term);
          ws.send(JSON.stringify({ type: 'created', terminalId }));
          console.log(`[Terminal Server] Created terminal ${terminalId} with node-pty`);
        } else {
          // Fallback to spawn for basic functionality
          const spawn = require('child_process').spawn;
          term = spawn(shell, [], { cwd, env: process.env });

          term.stdout.on('data', (data) => {
            try {
              ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
            } catch (e) {
              console.error('[Terminal Server] Error sending data:', e.message);
            }
          });

          term.stderr.on('data', (data) => {
            try {
              ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
            } catch (e) {
              console.error('[Terminal Server] Error sending data:', e.message);
            }
          });

          term.on('exit', (exitCode) => {
            console.log(`[Terminal Server] Terminal ${terminalId} exited with code ${exitCode}`);
            ws.send(JSON.stringify({ type: 'exit', exitCode }));
          });

          terminals.set(terminalId, term);
          ws.send(JSON.stringify({ type: 'created', terminalId }));
          console.log(`[Terminal Server] Created terminal ${terminalId} with spawn`);
        }
      } else if (data.type === 'input') {
        // Send input to terminal
        if (term) {
          if (useNodePty) {
            term.write(data.data);
          } else {
            term.stdin.write(data.data);
          }
        }
      } else if (data.type === 'resize') {
        // Resize terminal
        if (term && useNodePty) {
          term.resize(data.cols, data.rows);
          console.log(`[Terminal Server] Resized terminal ${terminalId} to ${data.cols}x${data.rows}`);
        }
      }
    } catch (e) {
      console.error('[Terminal Server] Error processing message:', e);
      ws.send(JSON.stringify({ type: 'error', message: e.message }));
    }
  });

  ws.on('close', () => {
    console.log(`[Terminal Server] Client disconnected: Terminal ${terminalId}`);
    if (term) {
      if (useNodePty) {
        term.kill();
      } else {
        term.kill();
      }
      terminals.delete(terminalId);
    }
  });

  ws.on('error', (error) => {
    console.error(`[Terminal Server] WebSocket error for terminal ${terminalId}:`, error);
  });
});

// Start server
const PORT = process.env.TERMINAL_PORT || 3001;
server.listen(PORT, () => {
  console.log(`[Terminal Server] WebSocket server running on ws://localhost:${PORT}`);
  console.log(`[Terminal Server] Using ${useNodePty ? 'node-pty' : 'child_process'} for terminal emulation`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('[Terminal Server] Shutting down...');
  terminals.forEach((term) => {
    if (useNodePty) {
      term.kill();
    } else {
      term.kill();
    }
  });
  server.close();
  process.exit(0);
});
