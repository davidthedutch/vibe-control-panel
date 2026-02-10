# Vibe Control Panel

## Project Overzicht
- **Naam**: Vibe Control Panel
- **Live URL**: https://vibe-control-panel-web.vercel.app
- **Stack**: Next.js 15 (App Router), Tailwind CSS, Supabase, TypeScript
- **Monorepo**: Turborepo (`apps/web`, `packages/shared`)
- **Deployment**: Vercel (project: `vibe-control-panel-web`)

## Symbiose met Escal
- **Escal project**: `H:\Onedrive\PC-Rogier\Oud\2026-02-07\clubguide\` (mapnaam nog `clubguide`)
- **API Client**: `src/lib/escal-api-client.ts` - typed fetch wrapper met API Key auth
- **Env vars**: `ESCAL_API_URL`, `ESCAL_API_KEY` (server-side), `NEXT_PUBLIC_ESCAL_PREVIEW_URL` (client-side)
- **Feature Registry**: Control Panel kan Escal features aan/uit zetten via `/api/features`
- **Conventie**: Escal sectie in dashboard bereikbaar via `/escal/*` routes

## Escal Dashboard Routes
```
/escal              # Dashboard overzicht
/escal/events       # Event management
/escal/events/[id]  # Event detail
/escal/users        # User management
/escal/users/[id]   # User detail
/escal/live         # Real-time monitoring
/escal/scrapers     # Scraper status
/escal/analytics    # Analytics
/escal/settings     # Configuratie
```

## Key Files
- `src/lib/escal-api-client.ts` - Escal API client
- `src/lib/escal-data-loader.ts` - Bundled JSON data loader (fallback)
- `src/lib/actions/escal-actions.ts` - Server actions
- `src/lib/hooks/use-escal-data.ts` - React hooks voor Escal data

## Naming Convention
- Routes: `/escal/*`
- Types: `Escal*` prefix (EscalEvent, EscalUser, EscalMetrics, EscalSettings)
- Hooks: `useEscal*` (useEscalMetrics, useEscalEvents, useEscalUsers, etc.)
- Files: `escal-*` prefix
