# Terminal Tab - Vibe Control Panel

A fully functional terminal interface with xterm.js, WebSocket connection, and Claude Code integration.

## Features

### 1. Real Terminal Emulation
- **xterm.js** integration for full terminal functionality
- Color support with custom dark theme
- Clickable links with WebLinksAddon
- Automatic window resizing
- 1000 lines of scrollback history

### 2. WebSocket Server
- Node.js WebSocket server (`terminal-server.js`)
- Support for both `node-pty` (native terminal) and `child_process` (fallback)
- Auto-reconnection on disconnect
- Multiple terminal session support

### 3. Prompt Input Panel
- AI model selector (Claude Opus 4.6 / Claude Sonnet 4.5)
- Generate and preview commands before execution
- Edit generated commands
- Quick action buttons:
  - Run dev server
  - Run tests
  - Build project
  - Scan components

### 4. Prompt History Panel
- Last 20 prompts displayed
- Status indicators (success/failed/partial)
- Shows components created and files changed
- One-click repeat functionality
- Expandable details for each prompt

### 5. Output Parser
- Automatic error detection
- Warning extraction
- File change tracking
- Component creation detection
- Build statistics extraction

### 6. Notifications
- Real-time error/warning notifications
- Auto-dismiss after 5 seconds
- Visual distinction by type (error/warning/success)

## Installation

All dependencies are already installed:

```bash
# Core packages
@xterm/xterm
@xterm/addon-fit
@xterm/addon-web-links
ws

# Optional (for native terminal support)
node-pty
```

## Running the Terminal

### Option 1: Run both servers together (recommended)

```bash
npm run dev:all
```

This starts:
- Next.js dev server on http://localhost:3000
- Terminal WebSocket server on ws://localhost:3001

### Option 2: Run servers separately

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:terminal
```

## Usage

1. Navigate to http://localhost:3000/terminal
2. Wait for the WebSocket connection (green indicator in terminal header)
3. Type commands directly in the terminal, or use the prompt input panel above
4. Use quick action buttons for common tasks
5. View command history and repeat previous prompts from the right panel

## Prompt Input Panel

The prompt input panel allows you to:

1. **Write prompts**: Describe what you want in natural language
2. **Select AI model**: Choose between Opus 4.6 (more capable) or Sonnet 4.5 (faster)
3. **Generate command**: Preview the generated Claude Code command
4. **Edit**: Modify the command before execution
5. **Execute**: Run the command in the terminal

Example prompts:
```
Maak een responsive header met logo en navigatie
Voeg een contact formulier toe met validatie
Fix de styling van de hero sectie
```

## Quick Actions

Pre-configured commands for common tasks:

- **Run dev server**: `pnpm dev`
- **Run tests**: `pnpm test`
- **Build**: `pnpm build`
- **Scan components**: `claude "Scan alle componenten en update SITE_MANIFEST.json"`

## Output Parser

The terminal automatically monitors output for:

### Errors
- Error keywords (error, failed, exception, fatal)
- Module not found errors
- Permission denied
- Syntax errors
- Build failures

### Warnings
- Warning keywords (warning, warn, deprecated)
- Missing dependencies
- Deprecation notices

### File Changes
- Created/modified/updated files
- Component additions

### Build Statistics
- Duration (2.5s, 1200ms)
- File count (12 files, 45 modules)
- Build size (125 KB, 2.5 MB)

## Architecture

### Frontend (React)

**terminal-view.tsx**
- xterm.js instance management
- WebSocket client connection
- Terminal input/output handling
- Auto-reconnection logic

**prompt-input.tsx**
- AI model selection
- Command generation
- Quick action buttons

**prompt-history.tsx**
- History display and management
- Expandable prompt details
- Repeat functionality

**output-parser.ts**
- Pattern matching for errors/warnings
- File change extraction
- Component detection

**page.tsx**
- Layout management (resizable split panels)
- State coordination
- Notification system

### Backend (Node.js)

**terminal-server.js**
- WebSocket server on port 3001
- Terminal session management
- Input/output streaming
- Process lifecycle management

## WebSocket Protocol

### Client → Server

```json
// Create terminal session
{
  "type": "create",
  "cols": 80,
  "rows": 24,
  "cwd": "/path/to/project"
}

// Send input
{
  "type": "input",
  "data": "ls -la\r"
}

// Resize terminal
{
  "type": "resize",
  "cols": 100,
  "rows": 30
}
```

### Server → Client

```json
// Session created
{
  "type": "created",
  "terminalId": 1
}

// Terminal output
{
  "type": "output",
  "data": "total 64\ndrwxr-xr-x..."
}

// Process exit
{
  "type": "exit",
  "exitCode": 0
}

// Error
{
  "type": "error",
  "message": "Failed to spawn shell"
}
```

## Customization

### Change WebSocket Port

In `terminal-server.js`:
```javascript
const PORT = process.env.TERMINAL_PORT || 3001;
```

In `terminal-view.tsx`:
```typescript
<TerminalView wsUrl="ws://localhost:YOUR_PORT" />
```

### Modify Terminal Theme

In `terminal-view.tsx`, edit the `theme` object:
```typescript
theme: {
  background: '#0a0a0b',
  foreground: '#e2e8f0',
  cursor: '#3b82f6',
  // ... more colors
}
```

### Add Quick Actions

In `prompt-input.tsx`:
```typescript
const QUICK_ACTIONS = [
  { label: 'Your Action', icon: YourIcon, command: 'your command' },
  // ... more actions
];
```

### Customize Output Patterns

In `output-parser.ts`:
```typescript
const ERROR_PATTERNS = [
  /your pattern/i,
  // ... more patterns
];
```

## Troubleshooting

### WebSocket connection fails

1. Check if terminal server is running:
   ```bash
   npm run dev:terminal
   ```

2. Verify port 3001 is not in use:
   ```bash
   netstat -an | grep 3001
   ```

3. Check browser console for WebSocket errors

### Terminal not responding to input

1. Verify WebSocket connection status (green indicator)
2. Check terminal server logs for errors
3. Try refreshing the page to reconnect

### node-pty not working

The system automatically falls back to `child_process` if `node-pty` is not available. For full terminal emulation:

Windows:
```bash
npm install --global windows-build-tools
npm install node-pty
```

Linux/Mac:
```bash
npm install node-pty
```

### Commands not executing

1. Ensure you're pressing Enter after typing
2. Check if the shell is waiting for input (e.g., password prompt)
3. Verify the working directory is correct

## Performance

- Terminal output is streamed in real-time
- xterm.js efficiently handles large amounts of output
- WebSocket connection is persistent with auto-reconnection
- Output parser runs on new output only (incremental)

## Security Notes

- Terminal runs with current user permissions
- No command injection protection (intended for development only)
- WebSocket server should not be exposed publicly
- For production, implement authentication and command filtering

## Future Enhancements

Potential improvements:

1. Terminal multiplexing (tabs/splits)
2. Command autocomplete
3. Syntax highlighting for commands
4. Terminal themes selector
5. Export terminal session to file
6. Search in terminal output
7. Copy/paste improvements
8. Keyboard shortcuts
9. Session persistence
10. Cloud terminal integration

## Integration with Preview Tab

The terminal can be linked with the Preview tab to automatically generate prompts when visual changes are detected. This feature is designed to:

1. Monitor file changes in the Preview tab
2. Generate appropriate Claude Code commands
3. Automatically populate the prompt input
4. Allow one-click execution

Implementation details in the Preview tab documentation.
