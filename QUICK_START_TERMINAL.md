# Quick Start: Terminal Tab

## 5-Minute Setup

### 1. Install Dependencies (if not already done)

```bash
cd apps/web
npm install
```

This installs:
- @xterm/xterm - Terminal emulation
- @xterm/addon-fit - Auto-resize addon
- @xterm/addon-web-links - Clickable links
- ws - WebSocket library
- node-pty - Native terminal (optional)

### 2. Start the Application

**Option A: Run both servers together (recommended)**
```bash
npm run dev:all
```

**Option B: Run separately**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:terminal
```

**Option C: Use helper scripts**

Windows:
```bash
start-terminal.bat
```

Unix/Mac:
```bash
./start-terminal.sh
```

### 3. Open the Terminal

Navigate to: **http://localhost:3000/terminal**

### 4. Wait for Connection

Look for the status indicator in the terminal header:
- 🟢 Green = Connected (ready!)
- 🟡 Yellow = Connecting...
- 🔴 Red = Disconnected (will auto-reconnect)

### 5. Start Using

You have three ways to run commands:

**A. Direct Terminal Input**
- Click in the terminal
- Type: `echo "Hello World"`
- Press Enter

**B. AI Prompt Panel**
1. Type in the prompt box: "Maak een button component"
2. Select model: Claude Opus 4.6 or Sonnet 4.5
3. Click "Genereer prompt" to preview
4. Click "Uitvoeren" to run

**C. Quick Actions**
- Click "Run dev server" to start `pnpm dev`
- Click "Run tests" for `pnpm test`
- Click "Build" for `pnpm build`
- Click "Scan components" for component analysis

### 6. View History

The right panel shows your last 20 prompts:
- Click to expand and see details
- Click "Herhaal" to re-run a command
- See which files were changed
- Check success/failure status

---

## Test It Works

Run the test script:
```bash
node test-terminal.js
```

Expected output:
```
✓ Connected to terminal server
✓ Terminal session created (ID: 1)
→ Sending test command: echo "Hello from terminal test"
Hello from terminal test
✓ Test completed successfully!
```

---

## Common Issues

### "Disconnected" Status

**Fix:** Make sure terminal server is running
```bash
npm run dev:terminal
```

### Port Already in Use

**Fix:** Change the port in `terminal-server.js`
```javascript
const PORT = process.env.TERMINAL_PORT || 3002; // Change to 3002
```

### Can't Type in Terminal

**Fix:**
1. Check connection status (should be green)
2. Click in the terminal window to focus
3. Refresh the page

---

## What You Get

✅ Full terminal emulation with xterm.js
✅ Real-time command execution
✅ AI-powered command generation (Claude Code)
✅ Quick action buttons for common tasks
✅ Prompt history (last 20 commands)
✅ Error/warning detection with notifications
✅ Resizable split panels
✅ Auto-reconnection on disconnect
✅ Clickable URLs in output
✅ Syntax-highlighted commands

---

## File Locations

```
apps/web/
├── terminal-server.js              ← WebSocket server
├── start-terminal.bat              ← Windows start script
├── start-terminal.sh               ← Unix start script
├── test-terminal.js                ← Test connection
└── src/app/(dashboard)/terminal/
    ├── page.tsx                    ← Main page
    ├── terminal-view.tsx           ← xterm.js terminal
    ├── prompt-input.tsx            ← AI prompt input
    ├── generated-command.tsx       ← Command preview
    ├── prompt-history.tsx          ← History panel
    └── output-parser.ts            ← Error detection
```

---

## Documentation

- **TERMINAL_README.md** - Complete user guide
- **TERMINAL_IMPLEMENTATION.md** - Technical details
- **This file** - Quick start

---

## Next Steps

1. Try running some commands in the terminal
2. Test the AI prompt generation
3. Use quick actions for common tasks
4. Check the history panel
5. Try triggering an error to see notifications

---

## Example Commands to Try

```bash
# Basic commands
echo "Hello World"
pwd
ls -la

# Node/NPM
node --version
npm --version

# Git
git status
git log --oneline -5

# Claude Code (if installed)
claude "Create a simple button component"
claude --model sonnet "Add dark mode support"
```

---

## Keyboard Shortcuts

- **Enter** - Execute command (in terminal)
- **Enter** - Generate prompt (in prompt input)
- **Shift+Enter** - New line (in prompt input)
- **Ctrl+C** - Interrupt current process (in terminal)
- **Click & Drag** - Resize panels

---

## Support

Having issues? Check:
1. Both servers are running (`npm run dev:all`)
2. Port 3001 is available
3. Browser console for errors
4. Terminal server logs

---

**You're all set!** The terminal is ready to use. 🚀

Navigate to http://localhost:3000/terminal and start building!
