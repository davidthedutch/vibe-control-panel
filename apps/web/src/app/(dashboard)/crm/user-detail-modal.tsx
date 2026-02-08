'use client';

import { useUserSessions } from '@/lib/hooks/use-crm-data';
import type { OnlineUser } from '@/lib/hooks/use-crm-data';

interface UserDetailModalProps {
  user: OnlineUser | null;
  onClose: () => void;
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const { sessions, loading } = useUserSessions(user?.id || '');

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.name || `Anoniem #${user.id.substring(0, 8)}`}
              </h2>
              <p className="text-sm text-gray-500">{user.email || 'Geen email'}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Segment</p>
              <p className="mt-1 text-sm font-medium capitalize text-gray-900">{user.segment}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Apparaat</p>
              <p className="mt-1 text-sm font-medium capitalize text-gray-900">{user.device || 'Onbekend'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Huidige pagina</p>
              <code className="mt-1 block rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700">
                {user.currentPage || '/'}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Tijd op site</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{user.timeOnSite}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Browser</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{user.browser || 'Onbekend'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-600">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="px-6 py-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Sessie geschiedenis</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">Geen sessie geschiedenis beschikbaar</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {sessions.map((session) => {
                const startDate = new Date(session.started_at);
                const endDate = session.ended_at ? new Date(session.ended_at) : null;
                const duration = endDate
                  ? Math.floor((endDate.getTime() - startDate.getTime()) / 60000)
                  : null;

                return (
                  <div
                    key={session.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {startDate.toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            om {startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!session.ended_at && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Actief
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {duration !== null ? `${duration} minuten` : 'In progress'} •{' '}
                          {session.pages_visited.length} paginas • {session.device || 'Desktop'}
                        </p>
                        {session.pages_visited.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {session.pages_visited.slice(0, 5).map((page, i) => (
                              <code
                                key={i}
                                className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-600"
                              >
                                {page}
                              </code>
                            ))}
                            {session.pages_visited.length > 5 && (
                              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-500">
                                +{session.pages_visited.length - 5} meer
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
