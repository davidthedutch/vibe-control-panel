# Settings Tab - Vibe Control Panel

Complete implementation of the Settings Tab with real save/load functionality for managing project configuration, design tokens, policies, secrets, integrations, and backups.

## Features

### 1. Project Settings (`project-settings.tsx`)
- **Editable Fields:**
  - Project name and description
  - Project status (Planning, In Development, Live, Maintenance)
  - Environment URLs (Production, Staging, Development)
  - Tech stack configuration (Framework, Styling, Database, Auth, Deployment)
- **Database Integration:** All changes are saved to Supabase `project_settings` table
- **Real-time Updates:** Loading states and save confirmation

### 2. Design Token Editor (`token-editor.tsx`)
- **Visual Color Picker:** Interactive color selection for all design tokens
- **Typography Preview:** Live font family and size previews
- **Spacing Visualization:** Visual representation of spacing scale
- **Import/Export:**
  - Export tokens as `DESIGN_TOKENS.json`
  - Import tokens from JSON file with full parsing
- **Live Preview Section:**
  - Color palette grid
  - Typography scale demonstration
  - Component examples using tokens
- **Database Persistence:** Tokens saved to database and loaded on mount

### 3. Policies Editor (`policies-editor.tsx`)
- **Toggle System:** Enable/disable individual policy rules
- **Custom Rules:** Add new policy rules with descriptions
- **Delete Functionality:** Remove unwanted policies
- **Default Policies:**
  - No hardcoded colors
  - Image alt text required
  - Dependency review
  - Tests required (optional)
  - Max lines per component (optional)
- **Auto-save:** Changes persist to database

### 4. Secrets Manager (`secrets-manager.tsx`)
- **Security First:** Environment variables management with encryption
- **Show/Hide Toggle:** Secure display of secret values
- **Add/Delete:** Manage API keys and credentials
- **Auto-generate .env:** Display formatted environment variables
- **Security Warning:** Clear notice about client-side exposure risks
- **Best Practices:** Development-only, with production guidance

### 5. Integrations (`integrations.tsx`)
- **Service Integrations:**
  - Supabase (Database & Auth)
  - Vercel (Deployment)
  - Sentry (Error Tracking)
  - PostHog (Analytics)
  - Stripe (Payments)
  - Resend (Email)
- **Configuration UI:** Expandable config panels for each service
- **Connection Status:** Visual indicators for connected/disconnected state
- **External Links:** Quick access to service dashboards
- **Saved Configs:** API keys and project IDs persist securely

### 6. Backup & Export (`backup-settings.tsx`)
- **Full Export:**
  - Complete project backup as JSON
  - Includes all settings, tokens, policies, and integrations
- **Manifest Export:**
  - `SITE_MANIFEST.json` with project metadata
  - Stats and configuration summary
- **Import Functionality:**
  - Drag-and-drop or file selection
  - Validates backup structure
  - Confirms before restoring
  - Restores all settings sections
- **Auto-backup Settings:**
  - Toggle automatic backups
  - Frequency selection (Daily, Weekly, Monthly)
  - Last backup timestamp
- **Backup Contents Guide:** Visual list of what's included

## API Routes

### `/api/settings` (route.ts)
- **GET:** Fetch all project settings
  - Query param: `projectId` (defaults to 'default')
  - Returns complete settings object
  - Returns defaults if no settings exist

- **POST:** Save complete settings object
  - Body: `{ projectId, settings }`
  - Upserts to database
  - Returns saved data

- **PATCH:** Update specific section
  - Body: `{ projectId, section, data }`
  - Merges section data with existing settings
  - Returns updated data

## Custom Hook

### `useSettings<T>` (`hooks/useSettings.ts`)
Generic hook for managing settings sections:
```typescript
const { data, loading, save, saving } = useSettings<ProjectData>('project', defaultProject);
```

Features:
- Automatic loading on mount
- Type-safe data management
- Loading and saving states
- Error handling
- Section-based updates

## Database Schema

### `project_settings` Table
```sql
CREATE TABLE project_settings (
  id UUID PRIMARY KEY,
  project_id TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

Settings JSONB structure:
```json
{
  "project": { /* ProjectData */ },
  "tokens": { /* TokensData */ },
  "policies": [ /* PolicyRule[] */ ],
  "secrets": [ /* Secret[] */ ],
  "integrations": { /* IntegrationsData */ }
}
```

## Usage

### Adding a New Setting
1. Define the data type interface
2. Add default values
3. Use `useSettings` hook with section name
4. Implement UI with save button
5. Add loading state handling

Example:
```typescript
interface MySettings {
  feature: boolean;
  value: string;
}

const defaultSettings: MySettings = {
  feature: false,
  value: ''
};

function MyComponent() {
  const { data, loading, save, saving } = useSettings<MySettings>(
    'mySection',
    defaultSettings
  );

  // ... UI implementation
}
```

## Security Notes

1. **Secrets Management:**
   - Never expose secrets in client-side code
   - Use environment variables for production
   - Secrets manager is for development only
   - Implement proper encryption for production

2. **API Keys:**
   - Store sensitive keys in Supabase securely
   - Use Row Level Security policies
   - Never commit secrets to version control

3. **Backups:**
   - Backup files contain sensitive data
   - Store backups securely
   - Implement access controls for production

## File Structure

```
settings/
├── page.tsx                 # Main settings page with tab navigation
├── project-settings.tsx     # Project configuration
├── token-editor.tsx         # Design tokens with live preview
├── policies-editor.tsx      # Development policies
├── secrets-manager.tsx      # Environment variables
├── integrations.tsx         # Third-party services
├── backup-settings.tsx      # Export/import functionality
└── README.md               # This file

../api/settings/
└── route.ts                # API endpoints for settings

../hooks/
└── useSettings.ts          # Reusable settings hook

../lib/
└── supabase.ts            # Updated with project_settings table type
```

## Migration

Run the migration to create the `project_settings` table:

```bash
supabase migration up
```

Migration file: `supabase/migrations/003_project_settings.sql`

## Testing

1. Navigate to Settings tab
2. Modify any setting
3. Click Save
4. Refresh page
5. Verify changes persist

## Future Enhancements

- [ ] Version history for settings
- [ ] Rollback functionality
- [ ] Multi-project support
- [ ] Team collaboration features
- [ ] Export to actual ZIP with JSZip
- [ ] Real-time sync across tabs
- [ ] Settings validation schema
- [ ] Import from other platforms

## Dependencies

- `@supabase/supabase-js` - Database client
- `lucide-react` - Icons
- `react` - UI framework
- `next` - Framework

Optional for future:
- `jszip` - For real ZIP export
- `zod` - For validation schemas
