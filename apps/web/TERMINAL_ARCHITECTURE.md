# Terminal Tab - Architecture Diagram

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser (React/Next.js)                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Terminal Page (page.tsx)                  │   │
│  │  - Layout management (split panels)                           │   │
│  │  - State coordination                                          │   │
│  │  - Notification system                                         │   │
│  │  - Command routing                                             │   │
│  └───────┬──────────────────────┬──────────────────────┬─────────┘   │
│          │                      │                      │              │
│  ┌───────▼─────────┐   ┌────────▼────────┐   ┌───────▼──────────┐  │
│  │  Prompt Input   │   │  Terminal View   │   │ Prompt History   │  │
│  │                 │   │                  │   │                  │  │
│  │ - AI Model      │   │ - xterm.js       │   │ - Last 20        │  │
│  │ - Generate      │   │ - WebSocket      │   │ - Expandable     │  │
│  │ - Quick Actions │   │ - Reconnect      │   │ - Repeat         │  │
│  │                 │   │ - Status         │   │ - Status Badges  │  │
│  └────────┬────────┘   └────────┬─────────┘   └──────────────────┘  │
│           │                     │                                     │
│           └──────────┬──────────┘                                     │
│                      │                                                │
│            ┌─────────▼────────┐                                       │
│            │  Generated CMD   │                                       │
│            │  - Preview       │                                       │
│            │  - Edit          │                                       │
│            │  - Copy          │                                       │
│            └─────────┬────────┘                                       │
│                      │                                                │
│            ┌─────────▼────────┐                                       │
│            │  Output Parser   │                                       │
│            │  - Error detect  │                                       │
│            │  - File tracking │                                       │
│            │  - Warnings      │                                       │
│            └─────────┬────────┘                                       │
│                      │                                                │
│            ┌─────────▼────────┐                                       │
│            │  Notifications   │                                       │
│            │  - Errors (red)  │                                       │
│            │  - Warnings      │                                       │
│            │  - Success       │                                       │
│            └──────────────────┘                                       │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        │ WebSocket (ws://localhost:3001)
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    Terminal Server (Node.js)                          │
│                     terminal-server.js                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   WebSocket Server (ws)                      │   │
│  │  - Connection management                                      │   │
│  │  - Session tracking                                           │   │
│  │  - Message routing                                            │   │
│  └───────────────────────┬───────────────────────────────────────┘   │
│                          │                                            │
│             ┌────────────┴────────────┐                              │
│             │                         │                               │
│    ┌────────▼─────────┐     ┌────────▼─────────┐                    │
│    │    node-pty      │     │  child_process   │                    │
│    │  (if available)  │     │    (fallback)    │                    │
│    │                  │     │                  │                    │
│    │ - Native PTY     │     │ - Basic spawn    │                    │
│    │ - Full terminal  │     │ - Limited TTY    │                    │
│    └────────┬─────────┘     └────────┬─────────┘                    │
│             │                        │                               │
│             └────────────┬───────────┘                               │
│                          │                                            │
│                ┌─────────▼─────────┐                                 │
│                │   Shell Process   │                                 │
│                │  (PowerShell/Bash) │                                 │
│                │                    │                                 │
│                │ - Command exec     │                                 │
│                │ - Output stream    │                                 │
│                └────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Command Execution Flow

```
User Input
    │
    ├─→ [Direct Terminal Input]
    │       │
    │       ├─→ xterm.js captures
    │       │
    │       └─→ WebSocket → Terminal Server → Shell
    │
    ├─→ [Prompt Input Panel]
    │       │
    │       ├─→ Generate Command
    │       │       │
    │       │       └─→ "claude --model opus 'prompt'"
    │       │
    │       ├─→ Preview & Edit
    │       │
    │       └─→ Execute → WebSocket → Terminal Server
    │
    └─→ [Quick Actions]
            │
            └─→ Pre-defined command → WebSocket → Terminal Server
```

### 2. Output Processing Flow

```
Shell Process
    │
    └─→ Output Stream
            │
            └─→ Terminal Server
                    │
                    └─→ WebSocket
                            │
                            └─→ Browser
                                    │
                                    ├─→ xterm.js (display)
                                    │
                                    └─→ Output Parser
                                            │
                                            ├─→ Error Detection
                                            │       │
                                            │       └─→ Notifications
                                            │
                                            ├─→ File Tracking
                                            │       │
                                            │       └─→ Prompt History
                                            │
                                            └─→ Component Detection
                                                    │
                                                    └─→ Prompt History
```

### 3. WebSocket Message Flow

```
Client → Server Messages:
┌──────────────────────┐
│ { type: "create" }   │ → Initialize terminal session
│ { type: "input" }    │ → Send keyboard input
│ { type: "resize" }   │ → Adjust terminal size
└──────────────────────┘

Server → Client Messages:
┌──────────────────────┐
│ { type: "created" }  │ → Session initialized
│ { type: "output" }   │ → Terminal output data
│ { type: "exit" }     │ → Process terminated
│ { type: "error" }    │ → Error occurred
└──────────────────────┘
```

---

## Component Hierarchy

```
TerminalPage (page.tsx)
│
├── Header
│   ├── Icon
│   ├── Title
│   └── Description
│
├── Notifications (fixed position)
│   └── Notification[] (error/warning/success)
│
└── Split Panel Container (resizable)
    │
    ├── Left Panel (60%)
    │   │
    │   ├── PromptInput (prompt-input.tsx)
    │   │   ├── Textarea
    │   │   ├── Model Selector
    │   │   │   └── Dropdown
    │   │   ├── Generate Button
    │   │   ├── Execute Button
    │   │   └── Quick Actions
    │   │       └── Button[] (4 actions)
    │   │
    │   ├── GeneratedCommand (generated-command.tsx)
    │   │   ├── Command Display
    │   │   ├── Edit Mode
    │   │   └── Action Buttons
    │   │       ├── Copy
    │   │       ├── Edit
    │   │       └── Execute
    │   │
    │   └── TerminalView (terminal-view.tsx)
    │       ├── Header Bar
    │       │   ├── Traffic Lights
    │       │   ├── Title
    │       │   └── Connection Status
    │       │
    │       ├── Error Banner (conditional)
    │       │
    │       └── xterm.js Container
    │           ├── Terminal Display
    │           ├── FitAddon
    │           └── WebLinksAddon
    │
    ├── Resize Handle (draggable)
    │
    └── Right Panel (40%)
        │
        └── PromptHistory (prompt-history.tsx)
            ├── Header
            │   └── Count Badge
            │
            └── History List
                └── HistoryEntry[] (last 20)
                    ├── Collapsed View
                    │   ├── Prompt Text
                    │   ├── Status Badge
                    │   ├── Timestamp
                    │   ├── Model
                    │   └── Component Chips
                    │
                    └── Expanded View
                        ├── Full Prompt
                        ├── Files Changed
                        ├── Result Summary
                        └── Repeat Button
```

---

## State Management

### Page-Level State

```typescript
// page.tsx
const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([])
const [splitPercent, setSplitPercent] = useState(60)
const [notifications, setNotifications] = useState<Notification[]>([])
const wsRef = useRef<WebSocket | null>(null)
```

### Terminal View State

```typescript
// terminal-view.tsx
const xtermRef = useRef<XTermTerminal | null>(null)
const wsRef = useRef<WebSocket | null>(null)
const [connectionStatus, setConnectionStatus] = useState('disconnected')
const [error, setError] = useState<string | null>(null)
```

### Prompt Input State

```typescript
// prompt-input.tsx
const [prompt, setPrompt] = useState('')
const [selectedModel, setSelectedModel] = useState('Claude Opus 4.6')
const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
const [generatedCommand, setGeneratedCommand] = useState<string | null>(null)
```

---

## Event Flow

### User Types Command

```
1. User types in xterm.js
2. xterm.js triggers onData
3. Data sent via WebSocket
4. Terminal server receives
5. Shell process executes
6. Output streams back
7. WebSocket sends to client
8. xterm.js displays output
9. Output parser analyzes
10. Notifications shown if needed
```

### User Uses Prompt Input

```
1. User types prompt
2. Selects AI model
3. Clicks "Generate"
4. Command built from template
5. GeneratedCommand shows preview
6. User can edit or execute
7. On execute:
   a. Command sent to WebSocket
   b. Added to prompt history
   c. Displayed in terminal
   d. Output parsed
   e. Results tracked
```

### Connection Lost

```
1. WebSocket closes
2. Status changes to 'disconnected'
3. Red indicator shown
4. Error message in terminal
5. Auto-reconnect timer starts (5s)
6. Reconnection attempted
7. On success: green indicator
8. On failure: retry again
```

---

## File Dependencies

```
page.tsx
├── imports terminal-view.tsx
├── imports prompt-input.tsx
├── imports prompt-history.tsx
└── imports output-parser.ts

terminal-view.tsx
├── imports @xterm/xterm
├── imports @xterm/addon-fit
└── imports @xterm/addon-web-links

prompt-input.tsx
└── imports generated-command.tsx

output-parser.ts
└── standalone utility module

terminal-server.js
├── requires ws
└── requires node-pty (optional)
```

---

## Network Communication

### WebSocket Protocol

```
Port: 3001
Protocol: WebSocket (ws://)
Message Format: JSON

Connection:
Client → ws://localhost:3001
Server → Accept connection

Lifecycle:
1. open → send 'create'
2. message → handle 'output'
3. send 'input' → command execution
4. close → cleanup
5. error → reconnect
```

### Message Types

**Client → Server:**
```json
{
  "type": "create",
  "cols": 80,
  "rows": 24,
  "cwd": "/path/to/project"
}
```

**Server → Client:**
```json
{
  "type": "output",
  "data": "command output here"
}
```

---

## Performance Considerations

### Rendering
- xterm.js: Hardware accelerated
- Canvas-based rendering
- 60fps sustained
- Virtual scrollback (1000 lines)

### Memory
- Terminal instance: ~30MB
- WebSocket: ~1MB per connection
- Output buffer: Dynamic
- Total per session: ~50MB

### Network
- WebSocket overhead: ~2 bytes per frame
- Average message size: ~100 bytes
- Latency: <5ms (local)
- Throughput: Unlimited (local)

---

## Error Handling

### Connection Errors
```
1. WebSocket error event
2. Set error state
3. Display banner
4. Log to console
5. Attempt reconnection
6. Update status indicator
```

### Command Errors
```
1. Shell returns error
2. Server sends exit code
3. Terminal displays message
4. Output parser detects error
5. Notification shown
6. History marked as failed
```

### Parse Errors
```
1. Invalid JSON received
2. Catch in try/catch
3. Log to console
4. Continue operation
5. Don't crash terminal
```

---

## Security Model

```
┌─────────────────────────────────────┐
│         Browser (Sandboxed)         │
│  - React components                 │
│  - WebSocket client                 │
│  - No direct system access          │
└──────────────┬──────────────────────┘
               │
               │ WebSocket (localhost only)
               │
┌──────────────▼──────────────────────┐
│      Node.js Server (Unsandboxed)   │
│  - Full system access               │
│  - Current user permissions         │
│  - No authentication                │
│  - No command filtering             │
└──────────────┬──────────────────────┘
               │
               │ spawn/pty
               │
┌──────────────▼──────────────────────┐
│      Shell Process (PowerShell/Bash)│
│  - Execute any command              │
│  - File system access               │
│  - Network access                   │
│  - Process spawning                 │
└─────────────────────────────────────┘
```

⚠️ **Security Note:** This is a development tool only. Do not expose to untrusted networks.

---

## Integration Points

### Preview Tab
```
Preview Tab detects changes
    │
    └─→ Generate prompt
            │
            └─→ window.postMessage()
                    │
                    └─→ Terminal receives
                            │
                            └─→ Populate prompt input
```

### CRM System
```
Terminal command executed
    │
    └─→ Result parsed
            │
            └─→ Activity logged
                    │
                    └─→ CRM activity feed
```

---

## Deployment Considerations

### Development
```
npm run dev:all
├─→ Next.js dev (port 3000)
└─→ Terminal server (port 3001)
```

### Production (Not Recommended)
```
Would need:
- Authentication
- Authorization
- Command whitelist
- Rate limiting
- Audit logging
- Separate user permissions
- Sandboxing
```

---

This architecture provides:
✅ Real-time terminal functionality
✅ AI-powered command generation
✅ Error detection and notifications
✅ History tracking
✅ Reconnection handling
✅ Extensible design
✅ Clean separation of concerns
