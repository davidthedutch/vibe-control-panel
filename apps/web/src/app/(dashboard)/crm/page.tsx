'use client';

import { useState } from 'react';
import MetricCards from './metric-cards';
import UsersChart from './users-chart';
import FunnelChart from './funnel-chart';
import ActiveUsersTable from './active-users-table';
import SegmentFilter, { type Segment } from './segment-filter';
import UserDetailModal from './user-detail-modal';
import IntegrationSnippet from './integration-snippet';
import { useOnlineUsers, useCrmMetrics, useChartData, useFunnelData } from '@/lib/hooks/use-crm-data';
import { exportUsersToCSV, exportMetricsToCSV } from '@/lib/utils/export-csv';
import type { OnlineUser } from '@/lib/hooks/use-crm-data';

const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

// --- Page ---
export default function CrmPage() {
  const [segment, setSegment] = useState<Segment>('alle');
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);

  // Fetch real-time data
  const { users, loading: usersLoading } = useOnlineUsers(DEFAULT_PROJECT_ID);
  const { metrics, loading: metricsLoading } = useCrmMetrics(DEFAULT_PROJECT_ID);
  const { data: chartData, loading: chartLoading } = useChartData(DEFAULT_PROJECT_ID, 30);
  const { data: funnelData, loading: funnelLoading } = useFunnelData(DEFAULT_PROJECT_ID);

  const handleExportUsers = () => {
    exportUsersToCSV(users, 'crm-active-users');
  };

  const handleExportMetrics = () => {
    exportMetricsToCSV(metrics, 'crm-metrics');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              CRM — Gebruikers
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Realtime overzicht van je gebruikers en conversies
            </p>
          </div>

          {/* Live users badge & actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <div>
                <p className="text-3xl font-bold tabular-nums text-emerald-700">
                  {metricsLoading ? '...' : metrics.onlineNow}
                </p>
                <p className="text-xs font-medium text-emerald-600">gebruikers online</p>
              </div>
            </div>
            <IntegrationSnippet projectId={DEFAULT_PROJECT_ID} />
            <button
              onClick={handleExportMetrics}
              disabled={metricsLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mb-8">
          {metricsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <MetricCards metrics={metrics} />
          )}
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {chartLoading ? (
              <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
            ) : (
              <UsersChart data={chartData} />
            )}
          </div>
          <div className="lg:col-span-1">
            {funnelLoading ? (
              <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
            ) : (
              <FunnelChart data={funnelData} />
            )}
          </div>
        </div>

        {/* Segment Filter + Users Table */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Actieve sessies</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportUsers}
                disabled={usersLoading || users.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
              <SegmentFilter active={segment} onChange={setSegment} />
            </div>
          </div>
          {usersLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <ActiveUsersTable users={users} filter={segment} onUserClick={setSelectedUser} />
          )}
        </div>

        {/* User Detail Modal */}
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      </div>
    </div>
  );
}
