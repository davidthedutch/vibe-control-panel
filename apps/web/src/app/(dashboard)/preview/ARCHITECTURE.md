# Preview Tab - Architecture Diagram

## Component Hierarchy

```
PreviewPage (page.tsx)
├─── State Management
│    ├─── projectUrl (loaded from API)
│    ├─── loading/error states
│    ├─── mode (preview/select/edit)
│    ├─── device (desktop/tablet/mobile)
│    └─── showEditPanel flag
│
├─── useVibeSDK Hook
│    ├─── isReady (SDK connection status)
│    ├─── currentMode (synced with SDK)
│    ├─── selectedComponent (current selection)
│    ├─── latency (connection health)
│    ├─── iframeRef (reference to iframe)
│    └─── Message handlers
│         ├─── setMode()
│         ├─── updateToken()
│         ├─── updateTokensBatch()
│         ├─── updateText()
│         ├─── highlightComponent()
│         └─── ping()
│
├─── Top Toolbar
│    ├─── ModeSwitch Component
│    │    └─── [Preview] [Select] [Edit]
│    ├─── DeviceSwitch Component
│    │    └─── [Desktop] [Tablet] [Mobile]
│    └─── Status Indicators
│         ├─── SDK Connection (Wifi icon)
│         ├─── Latency (ms)
│         └─── Project URL
│
├─── Main Content Area
│    ├─── PreviewFrame Component
│    │    ├─── iframe (loads project URL)
│    │    ├─── Loading state
│    │    ├─── Error state
│    │    └─── Toolbar
│    │         ├─── Refresh button
│    │         └─── Screenshot button
│    │
│    └─── EditPanel Component (conditional)
│         ├─── Component Info
│         │    ├─── Name
│         │    ├─── File path
│         │    └─── Line number
│         ├─── Text Fields Section
│         │    └─── [data-vibe-field] inputs
│         ├─── Colors Section
│         │    ├─── Color picker
│         │    └─── Hex input
│         ├─── Spacing Section
│         │    ├─── Padding slider
│         │    └─── Margin slider
│         ├─── Font Section
│         │    └─── Font family dropdown
│         └─── Actions
│              ├─── AI Suggestion button
│              └─── Save button
│
└─── Bottom Info Bar (conditional)
     └─── Mode instructions + Selected component
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vibe Control Panel                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                     PreviewPage                         │   │
│  │                                                          │   │
│  │  1. Load Project from API                               │   │
│  │     ↓                                                    │   │
│  │  2. Get preview URL (dev/staging/prod)                  │   │
│  │     ↓                                                    │   │
│  │  3. Initialize useVibeSDK                               │   │
│  │     ↓                                                    │   │
│  │  4. Render PreviewFrame with URL                        │   │
│  │                                                          │   │
│  └──────────────┬───────────────────────────┬──────────────┘   │
│                 │                           │                   │
│                 ▼                           ▼                   │
│        ┌─────────────────┐       ┌──────────────────┐         │
│        │  ModeSwitch     │       │  DeviceSwitch    │         │
│        │  EditPanel      │       │  PreviewFrame    │         │
│        └─────────────────┘       └──────────────────┘         │
│                 │                           │                   │
└─────────────────┼───────────────────────────┼───────────────────┘
                  │                           │
                  │    PostMessage Events     │
                  │   ═══════════════════════ │
                  │                           │
┌─────────────────▼───────────────────────────▼───────────────────┐
│                          iframe                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    User's Website                       │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │              Vibe SDK                             │  │   │
│  │  │                                                    │  │   │
│  │  │  Listen for PostMessage events:                   │  │   │
│  │  │  • SET_MODE                                        │  │   │
│  │  │  • UPDATE_TOKEN                                    │  │   │
│  │  │  • UPDATE_TOKENS_BATCH                            │  │   │
│  │  │  • UPDATE_TEXT                                     │  │   │
│  │  │  • HIGHLIGHT_COMPONENT                            │  │   │
│  │  │  • PING                                            │  │   │
│  │  │                                                    │  │   │
│  │  │  Send PostMessage events:                         │  │   │
│  │  │  • SDK_READY                                       │  │   │
│  │  │  • ELEMENT_SELECTED                               │  │   │
│  │  │  • PONG                                            │  │   │
│  │  │  • HEALTH_REPORT                                   │  │   │
│  │  │                                                    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │           Component Tree with:                    │  │   │
│  │  │           • [data-vibe-id]                        │  │   │
│  │  │           • [data-vibe-component]                 │  │   │
│  │  │           • [data-vibe-field]                     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Message Flow Examples

### Example 1: Changing Mode

```
User Action: Click "Edit" button
     │
     ▼
ModeSwitch.onChange('edit')
     │
     ▼
PreviewPage: setMode('edit')
     │
     ├─→ Update local state
     │
     └─→ useVibeSDK.setMode('edit')
          │
          ▼
     Send PostMessage:
     {
       type: 'VIBE_SET_MODE',
       payload: { mode: 'edit' }
     }
          │
          ▼
     iframe: Vibe SDK receives message
          │
          ▼
     SDK switches to edit mode
     - Adds click listeners
     - Shows overlay
     - Ready for selection
```

### Example 2: Selecting and Editing Component

```
User Action: Click component in iframe
     │
     ▼
Vibe SDK: Capture click event
     │
     ├─→ Extract component info:
     │   • vibeId
     │   • name, file, line
     │   • editableFields
     │   • computedStyles
     │
     └─→ Send PostMessage:
         {
           type: 'VIBE_ELEMENT_SELECTED',
           payload: { ...componentInfo }
         }
          │
          ▼
useVibeSDK: Receive message
     │
     ├─→ Validate message
     │
     └─→ Update selectedComponent state
          │
          ▼
PreviewPage: React to state change
     │
     └─→ setShowEditPanel(true)
          │
          ▼
EditPanel: Renders with component data
     │
     ├─→ Display text fields
     ├─→ Display color pickers
     ├─→ Display spacing sliders
     └─→ Display font selector

─────────────────────────────────

User Action: Change color in EditPanel
     │
     ▼
EditPanel.onUpdateToken('color', '#ff0000')
     │
     ▼
PreviewPage.handleUpdateToken()
     │
     ▼
useVibeSDK.updateToken('color', '#ff0000')
     │
     ▼
Send PostMessage:
{
  type: 'VIBE_UPDATE_TOKEN',
  payload: { name: 'color', value: '#ff0000' }
}
     │
     ▼
Vibe SDK: Receive message
     │
     ├─→ Parse token name and value
     │
     └─→ Apply to DOM:
         document.documentElement.style
           .setProperty('--color', '#ff0000')
          │
          ▼
Browser: Re-paint with new color
          │
          ▼
User sees change IMMEDIATELY
```

### Example 3: Saving Changes

```
User Action: Click "Save" button
     │
     ▼
EditPanel.onSave()
     │
     ▼
PreviewPage.handleSave()
     │
     ├─→ Collect current state:
     │   • selectedComponent
     │   • all changes made
     │   • tokens modified
     │
     ├─→ Generate prompt:
     │   "Update Button component:
     │    - File: /components/Button.tsx:15
     │    - Modified text fields and styling
     │    - Applied design token updates"
     │
     └─→ Show prompt to user
          │
          ▼
     [Ready to send to Prompts API]
     logPrompt({
       projectId,
       promptText,
       promptType: 'modification',
       componentsAffected: [...],
       tokensUsed: [...],
       status: 'success'
     })
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    PreviewPage State                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Local State (useState):                                │
│  • projectUrl: string | null                            │
│  • loading: boolean                                      │
│  • error: string | null                                  │
│  • mode: 'preview' | 'select' | 'edit'                  │
│  • device: 'desktop' | 'tablet' | 'mobile'              │
│  • showEditPanel: boolean                                │
│                                                          │
│  SDK State (useVibeSDK):                                │
│  • isReady: boolean                                      │
│  • currentMode: VibeMode                                 │
│  • selectedComponent: SelectedComponentInfo | null       │
│  • latency: number | null                                │
│  • iframeRef: RefObject<HTMLIFrameElement>              │
│                                                          │
└─────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────────┐
│   Child          │              │   useVibeSDK         │
│   Components     │              │   Internal State     │
├──────────────────┤              ├──────────────────────┤
│ • ModeSwitch     │              │ Message Queue        │
│ • DeviceSwitch   │              │ Event Listeners      │
│ • PreviewFrame   │              │ Ping/Pong Timer      │
│ • EditPanel      │              │ Connection Status    │
└──────────────────┘              └──────────────────────┘
```

## Component Communication Patterns

### Pattern 1: Props Down, Events Up

```
PreviewPage
    │
    ├─→ Props: { mode, onChange }
    │   Component: ModeSwitch
    │   Event: onChange(newMode)
    │
    ├─→ Props: { device, onChange }
    │   Component: DeviceSwitch
    │   Event: onChange(newDevice)
    │
    └─→ Props: { selectedComponent, onUpdateToken, ... }
        Component: EditPanel
        Events: onUpdateToken(), onUpdateText(), onSave()
```

### Pattern 2: Hook-Based Side Effects

```
useVibeSDK
    │
    ├─→ useEffect: Setup PostMessage listener
    │   │
    │   └─→ Cleanup: Remove listener on unmount
    │
    ├─→ useEffect: Auto-ping every 10 seconds
    │   │
    │   └─→ Cleanup: Clear interval
    │
    └─→ useCallback: Memoize message senders
        • setMode
        • updateToken
        • updateText
        etc.
```

## File Dependencies

```
page.tsx
├── import PreviewFrame from './components/PreviewFrame'
├── import ModeSwitch from './components/ModeSwitch'
├── import DeviceSwitch from './components/DeviceSwitch'
├── import EditPanel from './components/EditPanel'
├── import { useVibeSDK } from './hooks/useVibeSDK'
└── import { getProject } from '@vibe/shared/lib/api'

useVibeSDK.ts
├── import { MESSAGE_TYPES, create*Message } from '@vibe/sdk/protocol'
└── import type { VibeMode, SelectedComponentInfo } from '@vibe/sdk/protocol'

EditPanel.tsx
├── import type { SelectedComponentInfo } from '@vibe/sdk/protocol'
└── import { rgbToHex } from '../utils/colors'

colors.ts
└── (no external dependencies, pure utility functions)
```

## Technology Stack

```
┌────────────────────────────────────────────┐
│            Frontend Stack                   │
├────────────────────────────────────────────┤
│ • React 18+ (Client Components)            │
│ • TypeScript (Strict Mode)                 │
│ • Next.js 14+ (App Router)                 │
│ • Tailwind CSS (Styling)                   │
│ • Lucide React (Icons)                     │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│          Communication Layer                │
├────────────────────────────────────────────┤
│ • PostMessage API (Cross-origin)           │
│ • Custom Protocol (@vibe/sdk/protocol)     │
│ • Message Validation                        │
│ • Type-safe Messages                        │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│           Data Layer                        │
├────────────────────────────────────────────┤
│ • Supabase Client                           │
│ • @vibe/shared/lib/api (REST)              │
│ • Type-safe API Responses                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│          Type System                        │
├────────────────────────────────────────────┤
│ • @vibe/shared/types (App types)           │
│ • @vibe/sdk/protocol (Protocol types)      │
│ • Local types.ts (Preview-specific)        │
└────────────────────────────────────────────┘
```

## Security Boundaries

```
┌─────────────────────────────────────────────────────┐
│                 Vibe Control Panel                   │
│                 (Trusted Context)                    │
│                                                      │
│  • Can send any PostMessage                         │
│  • Has full project access                          │
│  • Can modify settings                              │
│  • Validates incoming messages                      │
│                                                      │
└────────────────┬────────────────────────────────────┘
                 │
                 │  PostMessage API
                 │  (Secure Channel)
                 │
┌────────────────▼────────────────────────────────────┐
│                  iframe Sandbox                      │
│               (Isolated Context)                     │
│                                                      │
│  Sandbox Attributes:                                │
│  • allow-scripts                                     │
│  • allow-same-origin                                 │
│  • allow-forms                                       │
│  • allow-popups                                      │
│  • allow-modals                                      │
│                                                      │
│  Cannot:                                             │
│  • Access parent window directly                     │
│  • Read cookies from control panel                   │
│  • Make unauthorized API calls                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Performance Considerations

```
Optimization Strategies:
├── Component Level
│   ├── Lazy rendering (EditPanel only when needed)
│   ├── Memoized callbacks (useCallback)
│   ├── Efficient re-renders (proper dependencies)
│   └── Conditional rendering (mode-based UI)
│
├── Communication Level
│   ├── Message validation (reject invalid early)
│   ├── Batch updates (UPDATE_TOKENS_BATCH)
│   ├── Debouncing (for rapid changes)
│   └── Ping throttling (10s intervals)
│
├── State Management
│   ├── Minimal state (only what's needed)
│   ├── Local state (avoid prop drilling)
│   ├── No unnecessary state updates
│   └── Proper cleanup (useEffect)
│
└── DOM Manipulation
    ├── CSS custom properties (fast updates)
    ├── No forced reflows
    ├── Efficient iframe sizing
    └── Smooth transitions
```

This architecture provides a solid foundation for a production-ready preview system with:
- Clear separation of concerns
- Type-safe communication
- Performance optimization
- Security boundaries
- Extensibility
