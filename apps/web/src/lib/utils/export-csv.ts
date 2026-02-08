import type { OnlineUser } from '../hooks/use-crm-data';

export function exportUsersToCSV(users: OnlineUser[], filename: string = 'crm-users-export') {
  // Create CSV header
  const headers = ['ID', 'Name', 'Email', 'Segment', 'Current Page', 'Time on Site', 'Device', 'Browser'];

  // Create CSV rows
  const rows = users.map((user) => [
    user.id,
    user.name || 'Anonymous',
    user.email || 'N/A',
    user.segment,
    user.currentPage || '/',
    user.timeOnSite,
    user.device || 'desktop',
    user.browser || 'Unknown',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape cells that contain commas or quotes
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportMetricsToCSV(metrics: any, filename: string = 'crm-metrics-export') {
  const headers = ['Metric', 'Value', 'Trend'];
  const rows = [
    ['Total Users', metrics.totalUsers, `${metrics.trends.totalUsers}%`],
    ['Online Now', metrics.onlineNow, `${metrics.trends.onlineNow}%`],
    ['New This Week', metrics.newThisWeek, `${metrics.trends.newThisWeek}%`],
    ['Churn Rate', `${metrics.churnRate}%`, `${metrics.trends.churnRate}%`],
  ];

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
