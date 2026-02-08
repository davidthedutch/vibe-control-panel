# Vibe Control Panel

Een Control Panel voor het beheren, bewerken en monitoren van vibe-coded websites.

## Tech Stack

- **Web Control Panel**: Next.js 15 (App Router) + Tailwind CSS 4 + shadcn/ui
- **Mobile App**: Expo (React Native) met Expo Router
- **Database**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **AI Server**: Hetzner VPS met Ollama + web scrapers
- **Deployment**: Vercel (web) + Expo EAS (mobile)
- **Monorepo**: Turborepo + pnpm

## Project Structure

```
vibe-control-panel/
├── apps/
│   ├── web/                    # Next.js Control Panel
│   └── mobile/                 # Expo React Native app
├── packages/
│   ├── shared/                 # Shared types, utils, hooks
│   ├── ui/                     # Shared UI components (shadcn)
│   ├── vibe-sdk/              # Vibe SDK voor preview communicatie
│   └── manifest-tools/         # Tools voor SITE_MANIFEST.json
├── supabase/                   # Database schema & migrations
└── server/                     # AI server code (draait op VPS)
```

## Features

### Control Panel (9 Tabs)
1. **Preview** - Live preview + visueel bewerken
2. **Components** - Component registry + dependency graph
3. **Features** - Features & acties overzicht
4. **CRM** - Real-time gebruikers dashboard
5. **SEO** - SEO center met meta data beheer
6. **Analytics** - Event tracking + funnels
7. **Health** - Automatische health checks
8. **Terminal** - Embedded terminal + Claude Code integratie
9. **Settings** - Tokens, policies, secrets

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Git

### Installation

```bash
# Clone repository
git clone <repo-url>
cd vibe-control-panel

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Start development servers
pnpm dev
```

### Environment Setup

1. **Supabase**: Create project op supabase.com
2. **Vercel**: Connect repository voor auto-deploy
3. **Hetzner**: Provision CAX11 server voor AI workloads
4. **Expo**: Create account op expo.dev

Zie `.env.example` voor alle benodigde environment variables.

## Development

```bash
# Start all apps
pnpm dev

# Start alleen web
pnpm dev --filter=web

# Start alleen mobile
pnpm dev --filter=mobile

# Build all
pnpm build

# Lint
pnpm lint

# Type check
pnpm type-check
```

## Deployment

### Web (Vercel)
```bash
git push origin main
# Auto-deploy via Vercel GitHub integration
```

### Mobile (Expo EAS)
```bash
cd apps/mobile
eas build --platform all
```

## Cost Overview

### Starting (€12/maand)
- Vercel Free Tier
- Supabase Free Tier
- Hetzner CAX11 (€4/maand)
- Expo Free Tier
- Apple Developer (€8/maand)

### Growth (€150/maand)
- Vercel Pro (€20/maand)
- Supabase Pro (€25/maand)
- Hetzner CPX51 (€46/maand)
- Expo EAS (€29/maand)
- Apple Developer (€8/maand)

## Documentation

- [BUILDPLAN.md](./BUILDPLAN.md) - Detailed build plan & architecture
- [WORKFLOW.md](./WORKFLOW.md) - Development workflow
- [CLAUDE.md](./CLAUDE.md) - AI agent instructions
- [DESIGN_TOKENS.json](./DESIGN_TOKENS.json) - Design system tokens
- [SITE_MANIFEST.json](./SITE_MANIFEST.json) - Component registry

## License

Private project - All rights reserved
