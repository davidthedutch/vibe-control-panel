# Health Checks System

Complete health checking implementation for the Vibe Control Panel.

## Features Implemented

### 1. Real Health Checks

The system includes 8 comprehensive health checks:

#### Token Consistency Check
- Scans all source files for hardcoded color values (hex, rgb, rgba)
- Identifies pixel values that should use design tokens
- Reports files and line numbers for each hardcoded value
- **Status**: Pass (0 issues), Warn (1-10 issues), Fail (>10 issues)

#### Manifest Sync Check
- Validates that SITE_MANIFEST.json matches actual component files
- Checks multiple possible file locations for each component
- Reports missing components
- **Status**: Pass (all found), Warn (1-3 missing), Fail (>3 missing)

#### Broken Imports Check
- Scans all TypeScript/JavaScript files for import statements
- Resolves relative imports to actual file paths
- Checks for missing files and unresolved imports
- **Status**: Pass (0 broken), Warn (1-5 broken), Fail (>5 broken)

#### Broken Links Check
- Extracts internal links from all source files
- Validates links against Next.js app router and pages router
- Checks public folder for static assets
- **Status**: Pass (0 broken), Warn (1-5 broken), Fail (>5 broken)

#### Broken Images Check
- Finds image references in src, srcSet, markdown, and CSS
- Validates image paths against public folder and relative paths
- Reports missing images with file locations
- **Status**: Pass (all found), Warn (1-5 missing), Fail (>5 missing)

#### Accessibility Check
- Scans for missing alt attributes on images
- Checks for buttons without aria-labels or text
- Identifies links without text content
- Detects onClick handlers on divs without proper roles
- **Status**: Pass (0 issues), Warn (1-10 issues), Fail (>10 issues)

#### Console Errors Check
- Placeholder for runtime browser checks
- Requires Playwright/Puppeteer integration (commented example included)
- Would capture console errors during page navigation

#### Performance Metrics Check
- Placeholder for Lighthouse integration
- Would measure Core Web Vitals (LCP, CLS, FID/INP)
- Example implementation with Lighthouse commented in code

### 2. Health Score Calculation

- Overall score is calculated as weighted average of all checks
- Each check contributes a score from 0-100
- Score determines status: Pass (80+), Warn (50-79), Fail (<50)
- Animated circular progress indicator with color coding

### 3. History Tracking

- Stores health scores with timestamps in `.health-history.json`
- Maintains up to 90 days of history
- Automatically updates or creates daily entries
- Chart visualization showing score trends over time
- Generates placeholder data for initial setup

### 4. Notification System

Comprehensive notification system for health issues:

- **Configuration Options**:
  - Enable/disable notifications globally
  - Notify on failed checks
  - Notify on warnings
  - Notify on score drops (configurable threshold)

- **Notification Types**:
  - Fail: Critical issues that need immediate attention
  - Warn: Issues that should be addressed
  - Score Drop: Significant decrease in overall score

- **Features**:
  - Unread count indicator
  - Mark individual notifications as read
  - Mark all as read
  - Persistent storage in `.health-notifications.json`
  - Keeps last 50 notifications

### 5. Settings Panel

Side panel with configuration options:

- Enable/disable notification system
- Configure notification triggers
- Set score drop threshold
- Instructions for CI/CD integration
- Save configuration to `.health-config.json`

### 6. Auto-Run Integration

Instructions and setup for automatic health checks:

- Run checks after each deploy via CI/CD pipeline
- Example GitHub Actions workflow included
- POST to `/api/health/run` endpoint
- Automatically saves history and triggers notifications

## File Structure

```
apps/web/src/
├── app/
│   ├── (dashboard)/health/
│   │   ├── page.tsx                    # Main health checks page
│   │   ├── health-score.tsx            # Circular score indicator
│   │   ├── check-results.tsx           # Grid of check cards
│   │   ├── health-history.tsx          # Chart component
│   │   ├── settings-panel.tsx          # Settings side panel
│   │   └── notifications-panel.tsx     # Notifications side panel
│   └── api/health/
│       ├── run/route.ts                # Run all checks endpoint
│       ├── history/route.ts            # Get history endpoint
│       ├── notifications/route.ts      # Notifications CRUD
│       └── config/route.ts             # Settings CRUD
└── lib/health/
    ├── types.ts                        # TypeScript types
    ├── runner.ts                       # Check orchestration
    ├── storage.ts                      # History persistence
    ├── notifications.ts                # Notification system
    └── checks/
        ├── index.ts                    # Export all checks
        ├── token-consistency.ts        # Hardcoded values check
        ├── manifest-sync.ts            # Manifest validation
        ├── broken-imports.ts           # Import resolution
        ├── broken-links.ts             # Link validation
        ├── broken-images.ts            # Image validation
        ├── accessibility.ts            # A11y checks
        ├── console-errors.ts           # Runtime errors (placeholder)
        └── performance.ts              # Performance metrics (placeholder)
```

## API Endpoints

### POST/GET /api/health/run
Run all health checks and return results.

**Response**:
```json
{
  "checks": [
    {
      "id": "check-1",
      "name": "Token Consistentie",
      "type": "token-consistency",
      "status": "warn",
      "score": 75,
      "details": "3 hardcoded waarden gevonden",
      "expanded": "file.tsx:12 - #ff0000\nfile.tsx:28 - #333"
    }
  ],
  "overallScore": 85,
  "timestamp": "2026-02-08T10:30:00.000Z"
}
```

### GET /api/health/history
Get historical health scores.

**Query params**: `?days=30` (default: 30)

**Response**:
```json
{
  "history": [
    {
      "date": "2026-02-08",
      "score": 85,
      "timestamp": "2026-02-08T10:30:00.000Z"
    }
  ]
}
```

### GET /api/health/notifications
Get all notifications.

**Query params**: `?action=count` (get unread count only)

**Response**:
```json
{
  "notifications": [
    {
      "id": "notif-123",
      "timestamp": "2026-02-08T10:30:00.000Z",
      "type": "fail",
      "title": "Check Failed: Broken Imports",
      "message": "5 broken imports found",
      "read": false
    }
  ]
}
```

### POST /api/health/notifications
Update notification status.

**Body**:
```json
{
  "action": "mark_read",
  "notificationId": "notif-123"
}
```

or

```json
{
  "action": "mark_all_read"
}
```

### GET/POST /api/health/config
Get or update notification configuration.

**GET Response**:
```json
{
  "enabled": true,
  "notifyOnFail": true,
  "notifyOnWarn": true,
  "notifyOnScoreDrops": true,
  "scoreDropThreshold": 10
}
```

## Usage

### Running Checks Manually

1. Navigate to `/health` in the dashboard
2. Click the "Run Checks" button
3. Wait for checks to complete (typically 2-5 seconds)
4. View results in the check cards below

### Setting Up Auto-Run

Add to your CI/CD pipeline (e.g., `.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... your deployment steps ...

      - name: Run Health Checks
        run: |
          curl -X POST https://your-domain.com/api/health/run
```

### Viewing History

The history chart automatically displays the last 30 days of health scores. It updates after each check run.

### Managing Notifications

1. Click the bell icon in the header to view notifications
2. Click the checkmark on individual notifications to mark as read
3. Use "Mark all as read" to clear all unread notifications
4. The badge shows the count of unread notifications

### Configuring Settings

1. Click the settings icon in the header
2. Toggle notification options as needed
3. Set score drop threshold (1-50 points)
4. Click "Save" to persist changes

## Extending the System

### Adding New Checks

1. Create a new file in `src/lib/health/checks/`
2. Implement the check function with signature:
   ```typescript
   export async function checkMyFeature(): Promise<CheckResult>
   ```
3. Export it from `src/lib/health/checks/index.ts`
4. Add it to the `checkPromises` array in `src/lib/health/runner.ts`

### Example New Check

```typescript
// src/lib/health/checks/my-check.ts
import { CheckResult } from '../types';

export async function checkMyFeature(): Promise<CheckResult> {
  try {
    // Your check logic here
    const issues = [];

    // Scan/analyze/validate something

    const count = issues.length;
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let score = 100;

    if (count > 10) {
      status = 'fail';
      score = 0;
    } else if (count > 0) {
      status = 'warn';
      score = Math.max(50, 100 - count * 10);
    }

    return {
      name: 'My Feature Check',
      type: 'my-feature',
      status,
      score,
      details: `${count} issues found`,
      expanded: issues.join('\n')
    };
  } catch (error) {
    return {
      name: 'My Feature Check',
      type: 'my-feature',
      status: 'fail',
      score: 0,
      details: 'Check failed',
      expanded: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Performance Considerations

- All checks run in parallel for speed
- File system scans skip node_modules and build directories
- History limited to 90 days to prevent file growth
- Notifications limited to last 50 entries
- Checks typically complete in 2-5 seconds

## Data Storage

The system stores data in JSON files in the project root:

- `.health-history.json` - Historical scores
- `.health-notifications.json` - Notification queue
- `.health-config.json` - User configuration

Add these to `.gitignore` if needed:

```gitignore
.health-*.json
```

## Future Enhancements

Consider adding:

1. **Browser Runtime Checks**
   - Integrate Playwright for console error detection
   - Capture network failures
   - Screenshot visual regressions

2. **Performance Monitoring**
   - Lighthouse integration
   - Core Web Vitals measurement
   - Bundle size tracking

3. **Advanced Notifications**
   - Email/Slack integration
   - Webhook support
   - Custom notification rules

4. **Team Features**
   - Multi-user notifications
   - Check ownership/assignments
   - Comment threads on issues

5. **Trend Analysis**
   - Predictive health scoring
   - Issue frequency tracking
   - Component health heatmap
