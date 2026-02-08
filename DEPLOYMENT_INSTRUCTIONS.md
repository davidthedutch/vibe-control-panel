# Deployment Instructions - Vibe Control Panel

Complete stap-voor-stap handleiding voor het deployen van de Vibe Control Panel stack.

---

## 📚 Overzicht

Deze guide helpt je om:
1. ✅ GitHub repository (COMPLEET)
2. 🔄 Vercel deployment te configureren (95% compleet)
3. ⏳ Supabase database te setup en migreren
4. ⏳ Hetzner VPS voor AI workloads te provisionen
5. ⏳ Expo mobile app builds te configureren
6. ⏳ Alles te testen en live te zetten

**Totale tijd**: ~2-3 uur
**Moeilijkheidsgraad**: Medium

---

## Fase 1: Vercel Deployment (30 minuten)

### Status: 🔄 95% Compleet

#### Stap 1.1: Importeer Project
1. Ga naar https://vercel.com/rogiers-projects-632b5051
2. Klik op **"Import"** naast "Import Project"
3. Selecteer repository: **davidthedutch/vibe-control-panel**
4. Klik **"Import"**

#### Stap 1.2: Configureer Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `apps/web`
3. **Build Command**: `pnpm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `pnpm install` (auto-detected)

#### Stap 1.3: Environment Variables (Tijdelijk)
Voor nu, voeg dummy values toe (we updaten deze later):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-key
AI_SERVER_URL=http://placeholder-server:3001
OLLAMA_URL=http://placeholder-server:11434
```

**Waarom dummy values?**
- Vercel heeft env vars nodig voor eerste build
- We vullen echte credentials in na Supabase/Hetzner setup
- Build zal slagen maar runtime features werken pas na update

#### Stap 1.4: Deploy!
1. Klik **"Deploy"**
2. Wacht ~3-5 minuten voor eerste build
3. Noteer je Vercel URL: `https://vibe-control-panel-xxx.vercel.app`

**Expected output:**
```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Deployment ready
```

#### Stap 1.5: Verifieer Deployment
1. Open je Vercel URL
2. Je zou de app moeten zien (sommige features werken nog niet)
3. Check Vercel dashboard voor build logs

**✅ Vercel is nu compleet!**

---

## Fase 2: Supabase Database (45 minuten)

### Stap 2.1: Create Supabase Project

1. Ga naar https://supabase.com
2. Klik **"Start your project"**
3. Sign up met je GitHub account
4. Klik **"New Project"**

**Project Settings:**
- **Organization**: Maak nieuwe org of selecteer bestaande
- **Name**: `vibe-control-panel`
- **Database Password**: Genereer sterke password (BEWAAR DEZE!)
  - Gebruik password generator: https://passwordsgenerator.net/
  - Minimum 20 characters, mixed case, numbers, symbols
- **Region**: **West EU (Frankfurt)** (closest to Netherlands)
- **Pricing Plan**: **Free** (voor start)

5. Klik **"Create new project"**
6. Wacht ~2 minuten voor provisioning

### Stap 2.2: Kopieer Credentials

1. Ga naar **Project Settings** → **API**
2. Kopieer en bewaar deze values:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Anon/Public Key (safe voor client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (GEHEIM! Server-side only!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **BELANGRIJK**: Service Role Key is SUPER SECRET! Nooit committen!

### Stap 2.3: Setup Database Schema

1. Ga naar **SQL Editor** in Supabase dashboard
2. Klik **"New query"**
3. Plak het volgende schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create components table
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  dependencies JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create features table
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create users table (for CRM)
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table (for analytics)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create health_checks table
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_components_site_id ON components(site_id);
CREATE INDEX idx_features_site_id ON features(site_id);
CREATE INDEX idx_app_users_site_id ON app_users(site_id);
CREATE INDEX idx_events_site_id ON events(site_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_health_checks_site_id ON health_checks(site_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - refine later)
CREATE POLICY "Allow all operations on sites" ON sites FOR ALL USING (true);
CREATE POLICY "Allow all operations on components" ON components FOR ALL USING (true);
CREATE POLICY "Allow all operations on features" ON features FOR ALL USING (true);
CREATE POLICY "Allow all operations on app_users" ON app_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on health_checks" ON health_checks FOR ALL USING (true);

-- Insert demo site
INSERT INTO sites (name, url, status) VALUES
  ('Demo Site', 'https://example.com', 'active');
```

4. Klik **"Run"** (of druk Ctrl+Enter)
5. Verifieer: Ga naar **Table Editor** en check of tables zijn aangemaakt

### Stap 2.4: Enable Realtime

1. Ga naar **Database** → **Replication**
2. Enable replication voor deze tables:
   - `app_users` (voor live CRM updates)
   - `events` (voor live analytics)
   - `health_checks` (voor live monitoring)

3. Klik **"Enable"** voor elke table

### Stap 2.5: Setup Storage (voor file uploads)

1. Ga naar **Storage** → **Buckets**
2. Klik **"New bucket"**
3. **Name**: `uploads`
4. **Public bucket**: Aan (voor publieke assets)
5. Klik **"Create bucket"**

**Storage policies:**
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads' AND
    auth.role() = 'authenticated'
  );
```

**✅ Supabase is nu compleet!**

---

## Fase 3: Hetzner VPS Server (60 minuten)

### Stap 3.1: Create Hetzner Account

1. Ga naar https://www.hetzner.com/cloud
2. Klik **"Sign Up"**
3. Fill in gegevens en verifieer email
4. Add payment method (credit card of SEPA)

### Stap 3.2: Provision Server

1. Klik **"Add Server"**
2. **Location**: **Falkenstein, Germany** (closest to NL)
3. **Image**: **Ubuntu 24.04 LTS**
4. **Type**: **CAX11** (4 vCPU ARM, 8GB RAM, 40GB SSD)
5. **Volume**: None (voorlopig)
6. **Network**: Default
7. **SSH Key**:
   - Als je al een SSH key hebt, add deze
   - Anders: skip (we configureren password first)
8. **Name**: `vibe-ai-server`
9. **Labels**: `environment:production`, `service:ai`

10. Klik **"Create & Buy now"**
11. Server wordt geprovisioneerd (~1 minuut)
12. Noteer **Server IP** en **Root Password** (check email)

**Kosten**: €4.15/maand (€0.006/uur)

### Stap 3.3: Initial SSH Connection

**Windows (met WSL):**
```bash
# Open WSL terminal
wsl

# Connect to server
ssh root@<SERVER_IP>

# Type "yes" to accept fingerprint
# Enter root password from email
```

**Alternatief (PuTTY):**
1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Host Name: `<SERVER_IP>`
4. Port: 22
5. Click "Open"
6. Login as: `root`
7. Password: from email

### Stap 3.4: Setup Server

Nu volg je de **SERVER_SETUP.md** guide voor complete server configuratie:

```bash
# Download setup script (op de server)
cd /root
curl -O https://raw.githubusercontent.com/davidthedutch/vibe-control-panel/main/scripts/server-setup.sh
chmod +x server-setup.sh

# Run automated setup
./server-setup.sh
```

**Of handmatige setup:**
Volg alle stappen in [SERVER_SETUP.md](./SERVER_SETUP.md)

**Verwachte duur**: 45-60 minuten

### Stap 3.5: Test Server

```bash
# Test Ollama
curl http://localhost:11434/api/tags

# Test AI Server
curl http://localhost:3001/health

# Test externally (vanaf je Windows PC)
curl http://<SERVER_IP>/api/health
curl http://<SERVER_IP>/ollama/api/tags
```

**✅ Server is nu compleet!**

---

## Fase 4: Update Environment Variables (15 minuten)

Nu we alle services hebben, update de environment variables:

### Stap 4.1: Update Vercel Environment Variables

1. Ga naar Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Edit bestaande variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<van Fase 2>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<van Fase 2>
SUPABASE_SERVICE_ROLE_KEY=<van Fase 2>
AI_SERVER_URL=http://<SERVER_IP van Fase 3>:3001
OLLAMA_URL=http://<SERVER_IP van Fase 3>:11434
```

3. Klik **"Save"** voor elke variable
4. Trigger nieuwe deployment:
   - Ga naar **Deployments**
   - Klik **"Redeploy"** op laatste deployment
   - Check "Use existing build cache" (OFF)
   - Klik **"Redeploy"**

### Stap 4.2: Update Lokale .env.local

```bash
cd H:\Onedrive\PC-Rogier\Oud\2026-02-07\vibe-control-panel\apps\web

# Copy template
cp ../../.env.example .env.local

# Edit .env.local met Notepad of VS Code
notepad .env.local
```

**Plak echte credentials:**
```bash
NEXT_PUBLIC_SUPABASE_URL=<van Fase 2>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<van Fase 2>
SUPABASE_SERVICE_ROLE_KEY=<van Fase 2>
AI_SERVER_URL=http://<SERVER_IP van Fase 3>:3001
OLLAMA_URL=http://<SERVER_IP van Fase 3>:11434
```

**✅ Environment variables zijn up-to-date!**

---

## Fase 5: Expo Mobile App (30 minuten)

### Stap 5.1: Create Expo Account

1. Ga naar https://expo.dev
2. Klik **"Sign up"**
3. Sign up met GitHub account
4. Create organization (of gebruik personal account)

### Stap 5.2: Install EAS CLI

```bash
# Open terminal in project root
cd H:\Onedrive\PC-Rogier\Oud\2026-02-07\vibe-control-panel

# Install EAS CLI globally
npm install -g eas-cli

# Login
eas login

# Check login
eas whoami
```

### Stap 5.3: Configure Expo Project

```bash
cd apps/mobile

# Initialize EAS build
eas build:configure

# Follow prompts:
# - Generate new project ID? Yes
# - Add google-services.json for Android? No (for now)
# - Add GoogleService-Info.plist for iOS? No (for now)
```

### Stap 5.4: Update App Config

Edit `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "Vibe Control",
    "slug": "vibe-control-panel",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "<auto-generated-project-id>"
      }
    }
  }
}
```

### Stap 5.5: Create .env for Mobile

```bash
cd apps/mobile

# Create .env
echo "EXPO_PUBLIC_SUPABASE_URL=<van Fase 2>" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=<van Fase 2>" >> .env
```

### Stap 5.6: Test Local Build

```bash
# Start Expo dev server
pnpm dev

# Test in Expo Go app (download from App Store)
# Scan QR code met phone
```

### Stap 5.7: Create Production Build (Optioneel)

⚠️ **Let op**: Voor iOS build heb je Apple Developer account nodig ($99/jaar)

```bash
# Android build (free)
eas build --platform android --profile preview

# iOS build (requires Apple Developer account)
eas build --platform ios --profile preview
```

**Build duurt ~10-15 minuten**

**✅ Expo setup is compleet!**

---

## Fase 6: Testing & Verification (30 minuten)

### Stap 6.1: Test Web App (Vercel)

1. Open je Vercel URL: `https://vibe-control-panel-xxx.vercel.app`
2. Test deze features:
   - [ ] Homepage laadt correct
   - [ ] Login/signup werkt (Supabase Auth)
   - [ ] Dashboard data laadt (Supabase query)
   - [ ] Real-time updates werken (open 2 tabs)
   - [ ] File upload werkt (Supabase Storage)

### Stap 6.2: Test AI Server

```bash
# Test from command line
curl http://<SERVER_IP>/api/health

# Test Ollama
curl http://<SERVER_IP>/ollama/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello world",
  "stream": false
}'
```

### Stap 6.3: Test Database

1. Open Supabase dashboard → **Table Editor**
2. Check of demo data bestaat in `sites` table
3. Test insert:
   - Add manual row
   - Check of het verschijnt in web app

### Stap 6.4: Test Mobile App

1. Open Expo Go app op je phone
2. Scan QR code van `pnpm dev`
3. Test basic navigation
4. Test Supabase connection

### Stap 6.5: Performance Check

**Web App (Vercel):**
1. Open Chrome DevTools → Network
2. Reload page
3. Check load time (<2s expected)

**AI Server:**
```bash
# Test response time
time curl http://<SERVER_IP>/api/health
```

**Database:**
1. Supabase dashboard → **Logs** → **Database**
2. Check query performance (<100ms expected)

**✅ All tests passing? Deploy is compleet!**

---

## Fase 7: Post-Deployment Setup (15 minuten)

### Stap 7.1: Setup Custom Domain (Optioneel)

**Voor Vercel:**
1. Koop domain (Namecheap, Google Domains, etc.)
2. Vercel dashboard → **Settings** → **Domains**
3. Add domain
4. Update DNS records (Vercel toont instructies)
5. Wacht op SSL provisioning (~5 min)

**Voor Server:**
1. Add A record: `api.yourdomain.com` → `<SERVER_IP>`
2. Update Nginx config met domain
3. Run Certbot voor SSL
4. Update environment variables met nieuwe URL

### Stap 7.2: Setup Monitoring

**Vercel:**
- Automatic monitoring in dashboard
- Check **Analytics** tab voor traffic

**Supabase:**
- Automatic monitoring in dashboard
- Check **Database** → **Logs**

**Server:**
```bash
# Install monitoring tools
ssh deploy@<SERVER_IP>
sudo apt install -y htop

# Setup uptime monitoring (optional)
# Use: UptimeRobot, Pingdom, StatusCake (free tiers available)
```

### Stap 7.3: Setup Backups

**Supabase:**
- Automatic daily backups (Free tier: 7 days retention)
- Pro tier: Point-in-time recovery

**Server:**
```bash
# Setup automated backups (cron job)
ssh deploy@<SERVER_IP>

# Create backup script
nano /home/deploy/backup.sh
```

**Plak:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /home/deploy/backups/ollama-models-$DATE.tar.gz /home/deploy/ollama-models/
# Keep only last 7 days
find /home/deploy/backups/ -name "ollama-models-*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x /home/deploy/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/deploy/backup.sh
```

### Stap 7.4: Documentation

Update project README met:
- Live URLs (Vercel, API server)
- Deployment dates
- Team access credentials (gebruik password manager!)

**✅ Post-deployment compleet!**

---

## 🎯 Success Checklist

### Infrastructure:
- [x] GitHub repository created en gepusht
- [ ] Vercel deployment succesvol
- [ ] Supabase database provisioned en migreerd
- [ ] Hetzner VPS server geconfigureerd
- [ ] Expo mobile app configured

### Environment Variables:
- [ ] Vercel env vars updated met echte credentials
- [ ] Lokale .env.local aangemaakt
- [ ] Mobile .env aangemaakt
- [ ] Server .env aangemaakt

### Testing:
- [ ] Web app accessible via Vercel URL
- [ ] Database queries werken
- [ ] Real-time updates werken
- [ ] File uploads werken
- [ ] AI server responds
- [ ] Ollama model responses werken
- [ ] Mobile app builds

### Security:
- [ ] Supabase service role key is secret
- [ ] Server SSH key-based auth
- [ ] Firewall configured
- [ ] SSL certificates installed (voor productie)
- [ ] RLS policies reviewed

### Monitoring:
- [ ] Vercel analytics enabled
- [ ] Supabase logs monitored
- [ ] Server monitoring setup
- [ ] Backup strategy configured

---

## 💰 Cost Summary

### Starting (Eerste maand):
| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | €0 |
| Supabase | Free | €0 |
| Hetzner CAX11 | Paid | €4.15 |
| Expo | Free | €0 |
| **Total** | | **€4.15/maand** |

### At Scale (Bij groei):
| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | €20 |
| Supabase | Pro | €25 |
| Hetzner CPX51 | Paid | €46 |
| Expo | Production | €29 |
| Apple Developer | Annual | €8 |
| **Total** | | **€128/maand** |

---

## 📚 Referenties

- **DEPLOYMENT_LOG.md** - Log van alle uitgevoerde acties
- **SERVER_SETUP.md** - Gedetailleerde server configuratie
- **.env.example** - Template voor environment variables
- **README.md** - Project documentatie
- **BUILDPLAN.md** - Architectuur details

---

## 🆘 Troubleshooting

### Vercel build failed:
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

### Supabase connection errors:
```bash
# Verify credentials in .env
# Check Supabase project status
# Test connection: https://supabase.com/dashboard/project/<PROJECT_ID>/api
```

### Server niet bereikbaar:
```bash
# Check firewall
ssh deploy@<SERVER_IP>
sudo ufw status

# Check services
sudo systemctl status nginx
sudo systemctl status ai-server
```

### Mobile app crash:
```bash
# Check Expo logs
npx expo start
# Check console errors
# Verify EXPO_PUBLIC_* env vars
```

---

## 🎓 Next Steps

Na deployment:
1. **Ontwikkel features** volgens BUILDPLAN.md
2. **Integreer AI functies** met Ollama
3. **Test met echte users** (beta)
4. **Monitor performance** en optimaliseer
5. **Scale infrastructure** bij groei

---

## 📞 Support

- **GitHub Issues**: https://github.com/davidthedutch/vibe-control-panel/issues
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev

---

**Deployment voltooid!** 🚀

Je hebt nu een volledig werkende stack voor je Vibe Control Panel. Start met development en bouw geweldige features!

---

*Laatst bijgewerkt: 2026-02-08 door Claude Code*
