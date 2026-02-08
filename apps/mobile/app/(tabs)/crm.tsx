import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { scheduleNewUserNotification } from '@/lib/notifications';
import type { SiteUser, SiteSession } from '@vibe/shared';

interface Metrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalSessions: number;
}

const segmentColors = {
  visitor: '#6b7280',
  user: '#3b82f6',
  premium: '#8b5cf6',
  churned: '#ef4444',
};

export default function CRMScreen() {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    fetchData();
    subscribeToNewUsers();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('site_users')
        .select('*')
        .order('last_seen', { ascending: false })
        .limit(50);

      if (usersError) throw usersError;

      const users = (usersData || []) as SiteUser[];
      setUsers(users);

      // Calculate metrics
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const activeUsers = users.filter(
        (user) => new Date(user.lastSeen) > fiveMinutesAgo
      ).length;

      const newUsersToday = users.filter(
        (user) => new Date(user.firstSeen) > todayStart
      ).length;

      const totalSessions = users.reduce((sum, user) => sum + user.totalSessions, 0);

      setMetrics({
        totalUsers: users.length,
        activeUsers,
        newUsersToday,
        totalSessions,
      });
    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToNewUsers = () => {
    const subscription = supabase
      .channel('new-users')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_users',
        },
        (payload) => {
          const newUser = payload.new as SiteUser;
          scheduleNewUserNotification(newUser.name || newUser.email || 'New user');
          fetchData(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const renderMetricCard = (
    icon: string,
    label: string,
    value: number,
    color: string
  ) => (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const renderUser = ({ item }: { item: SiteUser }) => {
    const isOnline = new Date(item.lastSeen) > new Date(Date.now() - 5 * 60 * 1000);

    return (
      <View
        style={[
          styles.userCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {item.name || item.email || 'Anonymous'}
              </Text>
              {isOnline && (
                <View style={[styles.onlineBadge, { backgroundColor: colors.success }]} />
              )}
            </View>
            {item.email && item.name && (
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {item.email}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.segmentBadge,
              { backgroundColor: segmentColors[item.segment] + '20' },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: segmentColors[item.segment] },
              ]}
            >
              {item.segment}
            </Text>
          </View>
        </View>

        <View style={styles.userFooter}>
          <View style={styles.userStat}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
              Last seen {formatDate(item.lastSeen)}
            </Text>
          </View>

          <View style={styles.userStat}>
            <MaterialCommunityIcons
              name="chart-line"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.userStatText, { color: colors.textSecondary }]}>
              {item.totalSessions} sessions
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.metricsContainer}>
          {renderMetricCard('account-group', 'Total Users', metrics.totalUsers, '#3b82f6')}
          {renderMetricCard('account-check', 'Active Now', metrics.activeUsers, '#10b981')}
          {renderMetricCard('account-plus', 'New Today', metrics.newUsersToday, '#8b5cf6')}
          {renderMetricCard('chart-box', 'Total Sessions', metrics.totalSessions, '#f59e0b')}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Users
          </Text>
        </View>

        <View style={styles.usersList}>
          {users.map((user) => (
            <View key={user.id}>{renderUser({ item: user })}</View>
          ))}
        </View>

        {users.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-off-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No users yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  usersList: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  segmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userStatText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
