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

## VERPLICHT: Cross-Platform Consistentie

**HARDE REGEL — NIET AFWIJKEN:**
Escal heeft meerdere platforms die altijd visueel consistent moeten zijn:

| Platform | Locatie | Type |
|---|---|---|
| Preview (iPhone/iPad) | `apps/web/.../preview/components/escal-screens/` | Next.js componenten |
| Control Panel dashboard | `apps/web/.../escal/` (9 pagina's) | Next.js pagina's |
| Android app | `H:\...\clubguide\apps\mobile\` | Flutter (Dart) |
| iOS app | Zelfde Flutter codebase | Flutter (Dart) |

**Wanneer je een visuele wijziging maakt in Escal (kleur, layout, component, feature):**
1. Pas ALLE platforms aan — preview, control panel dashboard, Android/iOS
2. Controleer ELKE platform op consistentie voordat je klaar bent
3. Noem expliciet welke bestanden per platform zijn aangepast
4. Als een platform niet kan worden aangepast (bijv. andere repo), meld dit aan de gebruiker

**Dit geldt voor:** kleuren, typography, spacing, nieuwe features, verwijderde features, iconen, statusweergave, design tokens, branding.

**Afwijken van deze regel is NIET toegestaan.** Verschillende systemen die niet matchen worden rommelig en onbeheersbaar.

## Escal Design Tokens

**Alle Escal UI moet oranje als primary kleur gebruiken, NIET paars.**
Dit geldt voor ALLE platforms: preview schermen, control panel dashboard, en de Flutter app.

| Token | Hex | Tailwind |
|---|---|---|
| Primary | #FF8C42 | `orange-500` |
| Primary hover | #FF7A2E | `orange-600` |
| Secondary | #2A2D35 | `slate-800` |
| Background | #1A1D23 | `slate-900` |
| Surface | #22252D | `slate-800/80` |
| Text primary | #F1F3F5 | `white` / `slate-100` |
| Text secondary | #9CA3AF | `slate-400` |
| Border | #2F3339 | `slate-700` |
| Success | #4ADE80 | `green-400` |
| Warning | #FFA94D | `amber-400` |
| Error | #FF6B6B | `red-400` |

Kleur mapping voor Escal components (ALLE platforms):
- **Primary/accent**: `orange-*` (buttons, active states, highlights, badges)
- **Gradients**: `from-orange-* to-amber-*` (NIET purple/blue combinaties)
- **Info/datum**: `blue-*` (kalender, chat, datum filters)
- **Success**: `green-*` (online, check-in, veilig thuis)
- **Error/SOS**: `red-*` (alerts, noodknop)
- **Backgrounds**: `slate-*` (surfaces, borders, secondary text)
- **VERBODEN**: `purple-*` en `indigo-*` mogen NIET worden gebruikt als Escal primary/accent kleur

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
