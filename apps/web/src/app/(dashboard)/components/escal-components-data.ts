import {
  Activity,
  Calendar,
  Users,
  Radio,
  Bot,
  TrendingUp,
  Settings,
  Blocks,
} from 'lucide-react';

export type EscalTabKey = 'all' | 'dashboard' | 'events' | 'users' | 'live' | 'scrapers' | 'analytics' | 'settings';

export interface EscalComponentEntry {
  name: string;
  type: 'ui' | 'layout' | 'feature' | 'page';
  status: 'working' | 'planned' | 'broken';
  description: string;
  props: string[];
  filePath: string;
}

export interface EscalFeatureDoc {
  name: string;
  description: string;
  actions: string[];
  userFlow: string[];
}

export interface EscalTabData {
  label: string;
  icon: typeof Activity;
  components: EscalComponentEntry[];
  features: EscalFeatureDoc[];
}

export const escalTabs: Record<Exclude<EscalTabKey, 'all'>, EscalTabData> = {
  dashboard: {
    label: 'Dashboard',
    icon: Activity,
    components: [
      { name: 'MetricCard', type: 'ui', status: 'working', description: 'KPI kaart met trend indicator en icoon', props: ['title', 'value', 'trend', 'icon', 'color'], filePath: 'src/components/MetricCard.tsx' },
      { name: 'SubNav', type: 'layout', status: 'working', description: 'Sub-navigatie tabs binnen dashboard secties', props: ['items', 'activeTab', 'onChange'], filePath: 'src/components/layout/SubNav.tsx' },
      { name: 'ActivityFeed', type: 'feature', status: 'working', description: 'Realtime feed van recente activiteiten', props: ['activities', 'limit', 'onLoadMore'], filePath: 'src/components/ActivityFeed.tsx' },
      { name: 'LiveIndicator', type: 'ui', status: 'working', description: 'Pulserende badge voor live status', props: ['isLive', 'count', 'label'], filePath: 'src/components/LiveIndicator.tsx' },
    ],
    features: [
      { name: 'Escal Dashboard', description: 'Overzichtspagina met KPI metrics, grafieken en recente activiteit', actions: ['Refresh metrics', 'Filter op periode', 'Export als CSV'], userFlow: ['Open dashboard', 'Bekijk KPI cards', 'Klik op metric voor detail', 'Filter op tijdsperiode'] },
      { name: 'Notificatie Centre', description: 'Real-time notificaties voor events, gebruikers en systeem alerts', actions: ['Mark as read', 'Filter op type', 'Clear all'], userFlow: ['Bell icon klikken', 'Notificaties bekijken', 'Klik voor detail', 'Markeer als gelezen'] },
    ],
  },
  events: {
    label: 'Events',
    icon: Calendar,
    components: [
      { name: 'EventTable', type: 'feature', status: 'working', description: 'Sorteerbare en filterbare event tabel met paginatie', props: ['events', 'onFilter', 'onSort', 'page'], filePath: 'src/components/escal/EventTable.tsx' },
      { name: 'EventFilters', type: 'ui', status: 'working', description: 'Filter bar met status, bron en datum selectie', props: ['filters', 'onChange', 'sources'], filePath: 'src/components/escal/EventFilters.tsx' },
      { name: 'EventDetail', type: 'feature', status: 'working', description: 'Detail slide-over met alle event informatie', props: ['event', 'onClose', 'onEdit'], filePath: 'src/components/escal/EventDetail.tsx' },
      { name: 'ExportCSV', type: 'ui', status: 'working', description: 'Export knop die events als CSV download', props: ['data', 'filename', 'columns'], filePath: 'src/components/escal/ExportCSV.tsx' },
    ],
    features: [
      { name: 'Event Management', description: 'CRUD operaties voor events met scraper integratie', actions: ['Toevoegen', 'Bewerken', 'Verwijderen', 'Status wijzigen'], userFlow: ['Ga naar events pagina', 'Filter op status/bron', 'Klik event voor detail', 'Bewerk of verwijder'] },
      { name: 'Event Import', description: 'Automatisch events importeren via scrapers (RA, Partyflock, DJGuide)', actions: ['Trigger scrape', 'Review imports', 'Approve/reject'], userFlow: ['Scraper triggeren', 'Nieuwe events reviewen', 'Goedkeuren of afwijzen', 'Event verschijnt in lijst'] },
    ],
  },
  users: {
    label: 'Users',
    icon: Users,
    components: [
      { name: 'UserTable', type: 'feature', status: 'working', description: 'Gebruikerstabel met zoek en filter functionaliteit', props: ['users', 'onSelect', 'onFilter'], filePath: 'src/components/escal/UserTable.tsx' },
      { name: 'UserDetail', type: 'feature', status: 'working', description: 'Gebruiker profiel met activiteit en statistieken', props: ['user', 'onClose', 'onBan'], filePath: 'src/components/escal/UserDetail.tsx' },
      { name: 'LevelBadge', type: 'ui', status: 'working', description: 'Badge die gebruiker level en XP toont', props: ['level', 'xp', 'size'], filePath: 'src/components/escal/LevelBadge.tsx' },
      { name: 'StatusBadge', type: 'ui', status: 'working', description: 'Kleur-gecodeerde status indicator (online, offline, banned)', props: ['status', 'showLabel'], filePath: 'src/components/escal/StatusBadge.tsx' },
    ],
    features: [
      { name: 'User Management', description: 'Beheer gebruikers, bekijk profielen en modereer accounts', actions: ['Zoeken', 'Filteren', 'Ban/unban', 'Reset level'], userFlow: ['Open users pagina', 'Zoek gebruiker', 'Open profiel', 'Bekijk statistieken', 'Eventueel actie nemen'] },
    ],
  },
  live: {
    label: 'Live',
    icon: Radio,
    components: [
      { name: 'LiveMap', type: 'feature', status: 'planned', description: 'Google Maps integratie voor live buddy locaties', props: ['locations', 'onSelect', 'radius'], filePath: 'src/components/escal/LiveMap.tsx' },
      { name: 'BuddyPairs', type: 'feature', status: 'planned', description: 'Lijst van actieve buddy paren met status', props: ['pairs', 'onDisconnect'], filePath: 'src/components/escal/BuddyPairs.tsx' },
      { name: 'SafetyAlerts', type: 'feature', status: 'planned', description: 'Real-time safety alerts en SOS meldingen', props: ['alerts', 'onResolve', 'onEscalate'], filePath: 'src/components/escal/SafetyAlerts.tsx' },
      { name: 'RadiusChat', type: 'feature', status: 'planned', description: 'Chat binnen buddy radius met locatie sharing', props: ['messages', 'onSend', 'radius'], filePath: 'src/components/escal/RadiusChat.tsx' },
    ],
    features: [
      { name: 'Live Safety Buddies', description: 'Real-time buddy systeem met locatie tracking en safety alerts', actions: ['Buddy koppelen', 'Radius instellen', 'SOS versturen', 'Chat openen'], userFlow: ['Event bezoeken', 'Buddy selecteren', 'Locatie delen', 'Alerts ontvangen bij verlaten radius'] },
    ],
  },
  scrapers: {
    label: 'Scrapers',
    icon: Bot,
    components: [
      { name: 'ScraperCard', type: 'ui', status: 'working', description: 'Status kaart per scraper met laatste run info', props: ['scraper', 'onTrigger', 'onViewLogs'], filePath: 'src/components/escal/ScraperCard.tsx' },
      { name: 'ScraperLogs', type: 'feature', status: 'working', description: 'Log viewer met filter en zoek functionaliteit', props: ['logs', 'scraperId', 'onFilter'], filePath: 'src/components/escal/ScraperLogs.tsx' },
      { name: 'TriggerButton', type: 'ui', status: 'working', description: 'Button met loading state voor manueel triggeren', props: ['onTrigger', 'isRunning', 'label'], filePath: 'src/components/escal/TriggerButton.tsx' },
    ],
    features: [
      { name: 'Scraper Management', description: 'Beheer en monitor web scrapers voor event data', actions: ['Manueel triggeren', 'Logs bekijken', 'Schedule aanpassen'], userFlow: ['Open scrapers pagina', 'Bekijk status per scraper', 'Trigger scrape', 'Bekijk resultaten in logs'] },
    ],
  },
  analytics: {
    label: 'Analytics',
    icon: TrendingUp,
    components: [
      { name: 'BarChart', type: 'ui', status: 'working', description: 'Staafdiagram voor event en gebruiker statistieken', props: ['data', 'xKey', 'yKey', 'color', 'height'], filePath: 'src/components/charts/BarChart.tsx' },
      { name: 'LineChart', type: 'ui', status: 'working', description: 'Lijndiagram voor trends over tijd', props: ['data', 'lines', 'xKey', 'height'], filePath: 'src/components/charts/LineChart.tsx' },
      { name: 'DonutChart', type: 'ui', status: 'working', description: 'Donut grafiek voor verdeling (bronnen, genres)', props: ['data', 'nameKey', 'valueKey', 'colors'], filePath: 'src/components/charts/DonutChart.tsx' },
      { name: 'HeatmapCalendar', type: 'ui', status: 'planned', description: 'Kalender heatmap voor activiteit per dag', props: ['data', 'year', 'colorScale'], filePath: 'src/components/charts/HeatmapCalendar.tsx' },
    ],
    features: [
      { name: 'Event Analytics', description: 'Statistieken en grafieken over events, bezoekers en trends', actions: ['Filter op periode', 'Vergelijk bronnen', 'Export rapport'], userFlow: ['Open analytics', 'Selecteer periode', 'Bekijk grafieken', 'Exporteer als rapport'] },
    ],
  },
  settings: {
    label: 'Settings',
    icon: Settings,
    components: [
      { name: 'Toggle', type: 'ui', status: 'working', description: 'Aan/uit toggle switch voor instellingen', props: ['checked', 'onChange', 'label', 'disabled'], filePath: 'src/components/ui/Toggle.tsx' },
      { name: 'InputField', type: 'ui', status: 'working', description: 'Gestylede input met label, validatie en error state', props: ['label', 'value', 'onChange', 'error', 'type'], filePath: 'src/components/ui/InputField.tsx' },
      { name: 'FeatureFlags', type: 'feature', status: 'working', description: 'Feature flag beheer met aan/uit toggles per feature', props: ['features', 'onToggle', 'onSave'], filePath: 'src/components/escal/FeatureFlags.tsx' },
      { name: 'BuddyIntervals', type: 'feature', status: 'planned', description: 'Configuratie voor buddy check interval tijden', props: ['intervals', 'onChange', 'defaults'], filePath: 'src/components/escal/BuddyIntervals.tsx' },
    ],
    features: [
      { name: 'Feature Registry', description: 'Beheer welke Escal features actief zijn vanuit het Control Panel', actions: ['Feature aan/uit zetten', 'Status bekijken', 'Sync met API'], userFlow: ['Open settings', 'Bekijk feature lijst', 'Toggle feature', 'Wijzigingen worden direct doorgevoerd'] },
    ],
  },
};

export const tabKeys: EscalTabKey[] = ['all', 'dashboard', 'events', 'users', 'live', 'scrapers', 'analytics', 'settings'];

export const tabMeta: Record<EscalTabKey, { label: string; icon: typeof Activity }> = {
  all: { label: 'Alles', icon: Blocks },
  dashboard: { label: 'Dashboard', icon: Activity },
  events: { label: 'Events', icon: Calendar },
  users: { label: 'Users', icon: Users },
  live: { label: 'Live', icon: Radio },
  scrapers: { label: 'Scrapers', icon: Bot },
  analytics: { label: 'Analytics', icon: TrendingUp },
  settings: { label: 'Settings', icon: Settings },
};
