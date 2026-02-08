# Clubguide App Specification

**App Name**: Clubguide
**Type**: Consumer/Business Mobile & Web App
**Control Panel**: Vibe Control Panel (beheer de Clubguide app)

---

## 📱 Wat is Clubguide?

Clubguide is de eerste app die we gaan bouwen en beheren via het Vibe Control Panel.

**Doel**: [NOG TE SPECIFICEREN]

**Platforms**:
- iOS app (React Native via Expo)
- Android app (React Native via Expo)
- Web app (Next.js) - voor beheer en/of publieke site

---

## 🎯 Te Beantwoorden Vragen

Voordat we beginnen met bouwen, moeten we deze vragen beantwoorden:

### 1. Wat is het doel van Clubguide?
- [ ] Is het een gids voor nachtclubs/uitgaansgelegenheden?
- [ ] Is het een evenementen platform?
- [ ] Is het een ticketing systeem?
- [ ] Is het een social platform voor clubbezoekers?
- [ ] Anders: ___________

### 2. Wie is de doelgroep?
- [ ] Clubbezoekers/uitgaanders (B2C)
- [ ] Club eigenaren/managers (B2B)
- [ ] Evenement organisatoren (B2B)
- [ ] Promoters (B2B)
- [ ] Combinatie van bovenstaande

### 3. Kernfunctionaliteit
Wat zijn de belangrijkste features?
- [ ] Club/venue overzicht en search
- [ ] Evenement listings
- [ ] Ticket verkoop
- [ ] Reviews en ratings
- [ ] Social features (follow, like, share)
- [ ] Chat/messaging
- [ ] Loyalty programma
- [ ] Push notifications voor events
- [ ] Kaarten/navigatie
- [ ] Foto galerijen
- [ ] DJ/artist profiles
- [ ] Reserveringen/table booking
- [ ] Anders: ___________

### 4. Business Model
Hoe verdien je geld?
- [ ] Gratis app met advertenties
- [ ] Commission op ticket verkopen
- [ ] Subscription voor premium features
- [ ] Listing fees voor clubs/venues
- [ ] Freemium model
- [ ] Anders: ___________

### 5. Content Management
Wie voegt clubs/events toe?
- [ ] Admin via Control Panel
- [ ] Club eigenaren zelf (self-service)
- [ ] Automatisch via scraping/API's
- [ ] Community submitted (moderatie vereist)
- [ ] Combinatie

### 6. Regio/Locatie
Waar start je?
- [ ] Nederland (specifieke steden: _________)
- [ ] België
- [ ] Heel Europa
- [ ] Specifieke regio: ___________

---

## 🏗️ Technische Architectuur

### Frontend (Clubguide App):
```
apps/
├── clubguide-mobile/     # React Native (Expo)
│   ├── app/             # Expo Router pages
│   ├── components/      # UI components
│   ├── hooks/          # Custom hooks
│   └── services/       # API calls, Supabase
│
└── clubguide-web/       # Next.js (optioneel)
    ├── app/            # App Router
    ├── components/     # Shared components
    └── lib/           # Utils, API clients
```

### Backend Services:
- **Database**: Supabase (clubs, events, users, bookings)
- **Storage**: Supabase Storage (foto's, posters)
- **Auth**: Supabase Auth (gebruikers, club owners)
- **Real-time**: Supabase Realtime (live updates)
- **AI**: Ollama op Hetzner VPS (recommendations, search)
- **Search**: Supabase full-text search of Algolia

### Management:
- **Control Panel**: Vibe Control Panel (web app)
  - Beheer clubs, events, users
  - Analytics en monitoring
  - Content moderation
  - SEO management

---

## 📊 Database Schema (Voorbeeld)

### Core Tables:

```sql
-- Clubs/Venues
CREATE TABLE clubs (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  location GEOGRAPHY(POINT),  -- PostGIS voor geo queries
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  capacity INTEGER,
  opening_hours JSONB,
  photos TEXT[],
  featured BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  club_id UUID REFERENCES clubs(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  poster_url TEXT,
  ticket_url TEXT,
  price NUMERIC(10,2),
  artists TEXT[],
  music_genres TEXT[],
  age_limit INTEGER,
  capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (app users, niet admins)
CREATE TABLE app_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genres TEXT[],
  favorite_clubs UUID[],
  push_token TEXT,  -- voor notifications
  location_city TEXT,
  privacy_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews/Ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  club_id UUID REFERENCES clubs(id),
  user_id UUID REFERENCES app_users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',  -- moderation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins (optional social feature)
CREATE TABLE checkins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES app_users(id),
  club_id UUID REFERENCES clubs(id),
  event_id UUID REFERENCES events(id),
  photo_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites/Bookmarks
CREATE TABLE favorites (
  user_id UUID REFERENCES app_users(id),
  club_id UUID REFERENCES clubs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, club_id)
);
```

### Indexes:
```sql
CREATE INDEX idx_clubs_city ON clubs(city);
CREATE INDEX idx_clubs_location ON clubs USING GIST(location);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_club ON events(club_id);
```

---

## 🎨 Design & UX

### Key Screens (Mobile):

1. **Home/Discover**
   - Featured clubs
   - Upcoming events (vandaag, dit weekend)
   - Personalized recommendations
   - Search bar

2. **Search/Explore**
   - Filter by: city, date, genre, price
   - Map view
   - List view
   - Sort options

3. **Club Detail**
   - Photos carousel
   - Info (address, hours, capacity)
   - Upcoming events
   - Reviews & ratings
   - Get directions button
   - Social share

4. **Event Detail**
   - Event poster
   - Date, time, location
   - Lineup/artists
   - Ticket info & buy button
   - Share event
   - Remind me

5. **Profile**
   - User info
   - Favorites
   - Check-in history
   - Settings

6. **Tickets** (optional)
   - My tickets
   - QR codes
   - Order history

### Design Style:
- Modern, clean interface
- Dark mode friendly (night uit theme)
- Vibrant accent colors
- Focus op photo's/visuals
- Smooth animations

---

## 📈 MVP Features (Minimum Viable Product)

**Must-have voor launch:**

### Voor Gebruikers:
- ✅ Browse clubs in hun stad
- ✅ Zoeken op naam/genre
- ✅ Club details bekijken (info, foto's, locatie)
- ✅ Evenementen lijst per club
- ✅ Event details (datum, tijd, prijs)
- ✅ Kaart met club locaties
- ✅ Favoriete clubs opslaan
- ✅ Basic user profile
- ✅ Push notifications (events bij favoriete clubs)

### Voor Admins (via Control Panel):
- ✅ Clubs toevoegen/bewerken/verwijderen
- ✅ Events toevoegen/bewerken/verwijderen
- ✅ Foto's uploaden
- ✅ Users modereren
- ✅ Basic analytics (views, favorites)

### Nice-to-have (Fase 2):
- Reviews en ratings
- Social features (check-ins, friends)
- Ticket integratie
- User-generated content
- Advanced analytics
- AI recommendations

---

## 🚀 Launch Plan

### Pre-Launch (Week 1-2):
- [ ] Finaliseer app naam en branding
- [ ] Design app screens (Figma)
- [ ] Setup database schema
- [ ] Seed dummy data (10-20 clubs, 50+ events)
- [ ] Build MVP features

### Beta Testing (Week 3-4):
- [ ] TestFlight build (iOS)
- [ ] Internal testing met 10-20 gebruikers
- [ ] Verzamel feedback
- [ ] Fix bugs en verbeteringen

### Soft Launch (Week 5):
- [ ] Launch in 1-2 steden (bijvoorbeeld Amsterdam, Rotterdam)
- [ ] Seed met echte club data
- [ ] Kleine marketing campagne
- [ ] Monitor usage en crashes

### Full Launch (Week 6+):
- [ ] App Store en Google Play publicatie
- [ ] Marketing push (social media, PR)
- [ ] Expansie naar meer steden
- [ ] Partnerships met clubs

---

## 💡 AI Features (via Ollama)

Mogelijke AI integrations:

1. **Smart Search**
   - Natural language queries: "clubs met techno muziek vanavond"
   - Semantic search over club descriptions

2. **Personalized Recommendations**
   - "Based on your favorites, you might like..."
   - Genre/vibe matching

3. **Event Summaries**
   - AI-generated event previews
   - Highlight key info (lineup, special guests)

4. **Content Moderation**
   - Auto-filter inappropriate reviews
   - Flag spam/fake content

5. **Chatbot**
   - Help users find clubs/events
   - Answer FAQs ("Is deze club 18+?")

---

## 💰 Cost Estimate (Voor Clubguide)

### Development (eenmalig):
- Design: €500-1000 (Figma templates)
- Development: DIY met Claude Code (€0)
- Apple Developer: €99/jaar
- Google Play: €25 eenmalig

### Operational (maandelijks):
| Service | Start | Bij Groei |
|---------|-------|-----------|
| Hosting (Vercel + Hetzner) | €4 | €66 |
| Database (Supabase) | €0 | €25 |
| Expo/EAS | €0 | €29 |
| Domain | €10/jaar | €10/jaar |
| **Totaal** | **€4-5/maand** | **€120/maand** |

---

## 🎯 Success Metrics

**Launch goals (eerste 3 maanden):**
- 1,000+ downloads
- 100+ actieve gebruikers per week
- 50+ clubs in database
- 200+ events listed
- 4.0+ star rating in app stores

**Growth goals (6 maanden):**
- 10,000+ downloads
- 1,000+ weekly active users
- Expansie naar 5+ steden
- Partnerships met 10+ clubs

---

## 📝 Next Steps

**Volgende actie (na deployment compleet):**

1. **Clarify Vision**
   - Beantwoord bovenstaande vragen
   - Define MVP scope precies
   - Prioritize features

2. **Design Phase**
   - Create wireframes
   - Design UI screens
   - Choose color scheme/branding

3. **Development Phase**
   - Setup Clubguide project structure
   - Implement database schema
   - Build Control Panel integration
   - Develop mobile app features

---

## 📞 Overleg Punten

**Te bespreken:**

1. **Scope**: Welke features voor MVP?
2. **Regio**: Welke steden eerst?
3. **Content**: Wie voegt clubs/events toe?
4. **Monetization**: Gratis of betaald model?
5. **Timeline**: Wanneer wil je launchen?

---

*Dit document wordt aangevuld naarmate we meer details weten over Clubguide.*

*Laatst bijgewerkt: 2026-02-08*
