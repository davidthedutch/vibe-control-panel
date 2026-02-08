# Preview Tab Implementation

This directory contains the complete implementation of the Preview tab for the Vibe Control Panel.

## Overview

The Preview tab provides a live, interactive preview of your website with the ability to:
- View your site in different device sizes (desktop, tablet, mobile)
- Switch between Preview, Select, and Edit modes
- Select and edit components visually
- Update design tokens in real-time
- Take screenshots
- Communicate with the Vibe SDK via PostMessage protocol

## Architecture

### Components

#### `PreviewFrame.tsx`
The main iframe container that loads your website and handles:
- Iframe lifecycle management (loading, errors, refresh)
- PostMessage communication setup
- Screenshot functionality
- Responsive device sizing
- Loading and error states

**Props:**
- `url`: The website URL to preview
- `deviceWidth`: Width of the preview viewport
- `deviceHeight`: Height of the preview viewport
- `onMessage`: Callback for handling PostMessage events
- `onReady`: Callback when iframe is loaded

#### `ModeSwitch.tsx`
Toggle between interaction modes:
- **Preview**: Normal viewing mode, no interactions
- **Select**: Hover over components to highlight them
- **Edit**: Click components to open the edit panel

**Props:**
- `mode`: Current mode ('preview' | 'select' | 'edit')
- `onChange`: Callback when mode changes

#### `DeviceSwitch.tsx`
Switch between device viewport sizes:
- **Desktop**: 1440×900px
- **Tablet**: 768×1024px
- **Mobile**: 375×667px

**Props:**
- `device`: Current device type
- `onChange`: Callback when device changes

**Exports:**
- `DEVICE_SIZES`: Object mapping device types to dimensions

#### `EditPanel.tsx`
Side panel that appears in Edit mode when a component is selected. Provides controls for:
- **Text Fields**: Edit editable text content (from `[data-vibe-field]` attributes)
- **Color Picker**: Modify colors (text, background, borders)
- **Spacing Controls**: Adjust padding and margins with sliders
- **Font Selector**: Change font families
- **AI Suggestion**: Request AI-powered design improvements
- **Save Button**: Generate and save a prompt describing the changes

**Props:**
- `selectedComponent`: Currently selected component info (or null)
- `onClose`: Callback to close the panel
- `onUpdateText`: Callback to update text fields
- `onUpdateToken`: Callback to update design tokens
- `onAISuggestion`: Callback to request AI suggestions
- `onSave`: Callback to save changes

### Hooks

#### `useVibeSDK.ts`
Custom hook that manages all communication with the Vibe SDK embedded in your website.

**Features:**
- Sends mode changes to the SDK
- Receives component selection events
- Updates design tokens (single or batch)
- Updates text content
- Highlights components on hover
- Monitors connection latency with ping/pong
- Validates incoming messages

**Returns:**
- `isReady`: Whether SDK has loaded and is ready
- `currentMode`: Current SDK mode
- `selectedComponent`: Currently selected component (or null)
- `latency`: Round-trip message latency in ms
- `iframeRef`: React ref to attach to the iframe
- `setMode`: Function to change the SDK mode
- `updateToken`: Function to update a single design token
- `updateTokensBatch`: Function to update multiple tokens at once
- `updateText`: Function to update text content
- `highlightComponent`: Function to highlight/unhighlight a component
- `ping`: Function to check SDK connectivity
- `clearSelection`: Function to clear the current selection

## PostMessage Protocol

The Preview tab communicates with the Vibe SDK using the protocol defined in `@vibe/sdk/protocol`.

### Messages Sent by Control Panel

1. **SET_MODE**: Change interaction mode
   ```typescript
   { type: 'VIBE_SET_MODE', payload: { mode: 'preview' | 'select' | 'edit' } }
   ```

2. **UPDATE_TOKEN**: Update a single design token
   ```typescript
   { type: 'VIBE_UPDATE_TOKEN', payload: { name: 'color', value: '#ff0000' } }
   ```

3. **UPDATE_TOKENS_BATCH**: Update multiple tokens at once
   ```typescript
   { type: 'VIBE_UPDATE_TOKENS_BATCH', payload: { tokens: [...] } }
   ```

4. **UPDATE_TEXT**: Update text content in a component
   ```typescript
   { type: 'VIBE_UPDATE_TEXT', payload: { vibeId: '...', fieldId: '...', value: '...' } }
   ```

5. **HIGHLIGHT_COMPONENT**: Highlight or unhighlight a component
   ```typescript
   { type: 'VIBE_HIGHLIGHT_COMPONENT', payload: { vibeId: '...', highlight: true } }
   ```

6. **PING**: Check SDK connectivity
   ```typescript
   { type: 'VIBE_PING', payload: { sentAt: timestamp } }
   ```

### Messages Received from SDK

1. **SDK_READY**: SDK has finished initializing
   ```typescript
   { type: 'VIBE_SDK_READY', payload: { version: '1.0.0', mode: 'preview' } }
   ```

2. **ELEMENT_SELECTED**: User clicked a component in select/edit mode
   ```typescript
   {
     type: 'VIBE_ELEMENT_SELECTED',
     payload: {
       vibeId, name, file, line, tagName, rect,
       editableFields, computedStyles
     }
   }
   ```

3. **PONG**: Response to ping
   ```typescript
   { type: 'VIBE_PONG', payload: { sentAt: timestamp, receivedAt: timestamp } }
   ```

4. **HEALTH_REPORT**: Performance and health data
   ```typescript
   { type: 'VIBE_HEALTH_REPORT', payload: { errors, performance, ... } }
   ```

## Usage

### Basic Implementation

```tsx
import PreviewPage from '@/app/(dashboard)/preview/page';

// The page automatically loads the project URL from the API
// and displays the preview with all controls
```

### Project Configuration

Make sure your project has a URL configured in the database:

```typescript
{
  urls: {
    development: 'http://localhost:3000',
    staging: 'https://staging.example.com',
    production: 'https://example.com'
  }
}
```

The Preview tab will use the first available URL in this priority order:
1. development
2. staging
3. production

### Installing the Vibe SDK

Your website must have the Vibe SDK installed for the Preview tab to work:

```bash
npm install @vibe/sdk
```

```tsx
// In your app layout or main component
import { VibeSDK } from '@vibe/sdk';

export default function App() {
  return (
    <>
      <VibeSDK />
      {/* Your app content */}
    </>
  );
}
```

## Features

### 1. Live Preview
- Loads your website in an iframe
- Supports any URL (development, staging, production)
- Handles loading and error states
- Refresh button to reload the preview

### 2. Device Switching
- Desktop (1440×900)
- Tablet (768×1024)
- Mobile (375×667)
- Displays current viewport dimensions

### 3. Interaction Modes

**Preview Mode:**
- Normal browsing, no special interactions
- Edit panel hidden
- No component highlighting

**Select Mode:**
- Hover over components to see highlights
- Click to select (selection info logged to console)
- Useful for inspecting the component tree

**Edit Mode:**
- Click components to open the edit panel
- Make changes to text, colors, spacing, fonts
- Changes applied immediately via PostMessage
- Save button generates a prompt for the AI

### 4. Visual Editing

When a component is selected in Edit mode, the panel shows:

- **Component Info**: Name, file path, line number
- **Text Fields**: Edit any `[data-vibe-field]` elements
- **Colors**: Color picker for text, background, borders
- **Spacing**: Sliders for padding and margins
- **Fonts**: Dropdown for font family selection

### 5. Live Token Updates

Design token changes are applied instantly without rebuilding:
- Color changes update CSS custom properties
- Spacing adjustments update inline or via tokens
- Font changes update immediately
- No page reload required

### 6. AI Integration

The "AI Suggestion" button can be extended to:
- Analyze the selected component
- Suggest improvements based on design system
- Recommend better color combinations
- Optimize spacing and typography
- Generate component variants

### 7. Save & Prompt Generation

The Save button:
1. Collects all changes made in the session
2. Generates a descriptive prompt
3. Saves to the prompts table via API
4. Logs component modifications
5. Tracks design token usage

Example generated prompt:
```
Update Button component:
- File: /components/Button.tsx:15
- Modified text fields and styling
- Applied design token updates for consistency

Changes made via Vibe Control Panel Preview tab.
```

### 8. SDK Status

Top-right indicator shows:
- Connection status (Connected/Connecting)
- Latency in milliseconds
- Current project URL

### 9. Screenshot

Screenshot button captures the current preview state. Can be extended with:
- html2canvas for client-side screenshots
- Server-side rendering services
- Comparison screenshots (before/after)
- Automated visual regression testing

## Extending the Implementation

### Adding Custom Device Sizes

Edit `DeviceSwitch.tsx`:

```typescript
export const DEVICE_SIZES: Record<DeviceType, DeviceSize> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  // Add custom sizes:
  ultrawide: { width: 2560, height: 1440 },
  watch: { width: 312, height: 390 },
};
```

### Adding More Edit Controls

Extend `EditPanel.tsx` to add controls for:
- Border radius
- Box shadow
- Animations
- Opacity
- Z-index
- Display/flex properties

### Integrating AI Suggestions

Replace the placeholder `handleAISuggestion` with real AI integration:

```typescript
const handleAISuggestion = async () => {
  const response = await fetch('/api/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      component: selectedComponent,
      context: projectContext,
      designTokens: currentTokens,
    }),
  });

  const suggestions = await response.json();
  applySuggestions(suggestions);
};
```

### Real Screenshot Implementation

Add html2canvas for client-side screenshots:

```typescript
import html2canvas from 'html2canvas';

const handleScreenshot = async () => {
  if (!iframeRef.current) return;

  const canvas = await html2canvas(
    iframeRef.current.contentDocument.body
  );

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview-${Date.now()}.png`;
    a.click();
  });
};
```

## Troubleshooting

### SDK Not Connecting

1. Check that the Vibe SDK is installed in your project
2. Verify the iframe URL is correct and accessible
3. Check browser console for CORS errors
4. Ensure PostMessage origin validation is correct

### Component Not Highlighting

1. Verify components have `[data-vibe-id]` attributes
2. Check that the SDK is in 'select' or 'edit' mode
3. Look for JavaScript errors in the iframe console

### Token Updates Not Applying

1. Ensure your site uses CSS custom properties for tokens
2. Check that token names match your design system
3. Verify the SDK is processing UPDATE_TOKEN messages

### Performance Issues

1. Use batch token updates instead of individual updates
2. Debounce rapid changes (e.g., slider inputs)
3. Consider lazy-loading the EditPanel
4. Optimize iframe render performance

## Related Files

- Protocol definition: `packages/vibe-sdk/src/protocol.ts`
- API functions: `packages/shared/lib/api.ts`
- Type definitions: `packages/shared/types/index.ts`
- SDK implementation: `packages/vibe-sdk/src/index.ts`

## Next Steps

1. Implement real screenshot functionality
2. Integrate with AI endpoint for suggestions
3. Add undo/redo for changes
4. Implement change history
5. Add collaborative editing features
6. Create preset device sizes
7. Add custom viewport size input
8. Implement zoom controls
9. Add comparison view (side-by-side)
10. Create automated testing integration
