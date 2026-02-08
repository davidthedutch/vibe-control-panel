'use client';

import { useState } from 'react';
import { Settings, Palette, Shield, Plug, Download, Key } from 'lucide-react';
import ProjectSettings from './project-settings';
import TokenEditor from './token-editor';
import PoliciesEditor from './policies-editor';
import SecretsManager from './secrets-manager';
import Integrations from './integrations';
import BackupSettings from './backup-settings';

type TabId = 'project' | 'tokens' | 'policies' | 'secrets' | 'integrations' | 'backup';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'project', label: 'Project', icon: <Settings className="h-4 w-4" /> },
  { id: 'tokens', label: 'Design Tokens', icon: <Palette className="h-4 w-4" /> },
  { id: 'policies', label: 'Policies', icon: <Shield className="h-4 w-4" /> },
  { id: 'secrets', label: 'Secrets', icon: <Key className="h-4 w-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
  { id: 'backup', label: 'Backup', icon: <Download className="h-4 w-4" /> },
];

function TabContent({ activeTab }: { activeTab: TabId }) {
  switch (activeTab) {
    case 'project':
      return <ProjectSettings />;
    case 'tokens':
      return <TokenEditor />;
    case 'policies':
      return <PoliciesEditor />;
    case 'secrets':
      return <SecretsManager />;
    case 'integrations':
      return <Integrations />;
    case 'backup':
      return <BackupSettings />;
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('project');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your project, design tokens, policies, secrets, integrations and backups.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
}
