'use client';

import type { Segment } from './segment-filter';
import type { OnlineUser } from '@/lib/hooks/use-crm-data';

interface ActiveUsersTableProps {
  users: OnlineUser[];
  filter: Segment;
  onUserClick?: (user: OnlineUser) => void;
}

function DesktopIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
      />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

const segmentBadgeStyles: Record<string, string> = {
  premium: 'bg-amber-50 text-amber-700 border-amber-200',
  user: 'bg-blue-50 text-blue-700 border-blue-200',
  visitor: 'bg-gray-50 text-gray-600 border-gray-200',
  trial: 'bg-purple-50 text-purple-700 border-purple-200',
  churned: 'bg-red-50 text-red-600 border-red-200',
  actief: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactief: 'bg-gray-50 text-gray-500 border-gray-200',
};

function matchesFilter(user: OnlineUser, filter: Segment): boolean {
  if (filter === 'alle') return true;
  if (filter === 'premium') return user.segment === 'premium';
  if (filter === 'trial') return user.segment === 'trial';
  if (filter === 'churned') return user.segment === 'churned';
  if (filter === 'actief') return user.segment === 'premium' || user.segment === 'user';
  if (filter === 'inactief') return user.segment === 'visitor';
  return true;
}

export default function ActiveUsersTable({ users, filter, onUserClick }: ActiveUsersTableProps) {
  const filteredUsers = users.filter((u) => matchesFilter(u, filter));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-semibold text-gray-900">Actieve gebruikers</h3>
        <p className="text-sm text-gray-500">
          {filteredUsers.length} gebruiker{filteredUsers.length !== 1 ? 's' : ''} online
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Gebruiker</th>
              <th className="px-6 py-3">Huidige pagina</th>
              <th className="px-6 py-3">Tijd op site</th>
              <th className="px-6 py-3">Apparaat</th>
              <th className="px-6 py-3">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  Geen gebruikers gevonden voor dit segment.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const displayName = user.name ?? `Anoniem #${user.id}`;
                const displayEmail = user.email ?? 'Onbekend';
                const badgeStyle = segmentBadgeStyles[user.segment] ?? segmentBadgeStyles.visitor;
                const timeMinutes = parseInt(user.timeOnSite);
                const isStuck = user.stuck || timeMinutes >= 5;

                return (
                  <tr
                    key={user.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50/50"
                    onClick={() => onUserClick?.(user)}
                  >
                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                      </span>
                    </td>
                    {/* User */}
                    <td className="px-6 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-400">{displayEmail}</p>
                      </div>
                    </td>
                    {/* Current page */}
                    <td className="px-6 py-3.5">
                      <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">
                        {user.currentPage}
                      </code>
                    </td>
                    {/* Time on site */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{user.timeOnSite}</span>
                        {isStuck && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 border border-amber-200">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                              />
                            </svg>
                            Vastgelopen
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Device */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {user.device === 'desktop' ? <DesktopIcon /> : <MobileIcon />}
                        <span className="text-xs text-gray-500 capitalize">{user.device}</span>
                      </div>
                    </td>
                    {/* Segment */}
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${badgeStyle}`}
                      >
                        {user.segment}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
