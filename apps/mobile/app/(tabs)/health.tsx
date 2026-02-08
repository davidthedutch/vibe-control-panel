import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { scheduleHealthCheckNotification } from '@/lib/notifications';
import type { HealthCheck } from '@vibe/shared';

const statusColors = {
  pass: '#10b981',
  warn: '#f59e0b',
  fail: '#ef4444',
};

const statusIcons = {
  pass: 'check-circle',
  warn: 'alert',
  fail: 'close-circle',
};

export default function HealthScreen() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    fetchHealthChecks();
    subscribeToHealthChecks();
  }, []);

  const fetchHealthChecks = async () => {
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const checks = (data || []) as HealthCheck[];
      setChecks(checks);

      // Calculate overall score
      const scores = checks.filter((check) => check.score !== null);
      if (scores.length > 0) {
        const avgScore = scores.reduce((sum, check) => sum + (check.score || 0), 0) / scores.length;
        setOverallScore(Math.round(avgScore));
      } else {
        setOverallScore(0);
      }
    } catch (error) {
      console.error('Error fetching health checks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToHealthChecks = () => {
    const subscription = supabase
      .channel('health-checks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_checks',
        },
        (payload) => {
          const newCheck = payload.new as HealthCheck;

          // Send notification for failed checks
          if (newCheck.status === 'fail') {
            scheduleHealthCheckNotification(
              `${newCheck.checkType} check failed`
            );
          }

          fetchHealthChecks(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHealthChecks();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Warning';
    return 'Critical';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupChecksByType = () => {
    const grouped: Record<string, HealthCheck[]> = {};

    checks.forEach((check) => {
      if (!grouped[check.checkType]) {
        grouped[check.checkType] = [];
      }
      grouped[check.checkType].push(check);
    });

    return Object.entries(grouped).map(([type, checks]) => ({
      type,
      latestCheck: checks[0],
      history: checks.slice(0, 5),
    }));
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const groupedChecks = groupChecksByType();
  const scoreColor = getScoreColor(overallScore);

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
        {/* Overall Score */}
        <View style={styles.scoreContainer}>
          <View
            style={[
              styles.scoreCircle,
              {
                backgroundColor: colors.surface,
                borderColor: scoreColor,
              },
            ]}
          >
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {overallScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
              {getScoreLabel(overallScore)}
            </Text>
          </View>
        </View>

        {/* Health Checks */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Health Checks
          </Text>
        </View>

        <View style={styles.checksList}>
          {groupedChecks.map((group) => {
            const check = group.latestCheck;
            const statusColor = statusColors[check.status];
            const statusIcon = statusIcons[check.status];

            return (
              <View
                key={group.type}
                style={[
                  styles.checkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.checkHeader}>
                  <View style={styles.checkInfo}>
                    <Text style={[styles.checkType, { color: colors.text }]}>
                      {group.type
                        .split('_')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </Text>
                    <Text style={[styles.checkTime, { color: colors.textSecondary }]}>
                      {formatDate(check.createdAt)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={statusIcon as any}
                      size={18}
                      color={statusColor}
                    />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {check.status}
                    </Text>
                  </View>
                </View>

                {check.score !== null && (
                  <View style={styles.checkScore}>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          {
                            width: `${check.score}%`,
                            backgroundColor: getScoreColor(check.score),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.scoreText, { color: colors.textSecondary }]}>
                      {check.score}/100
                    </Text>
                  </View>
                )}

                {check.details && Object.keys(check.details).length > 0 && (
                  <View style={styles.checkDetails}>
                    {Object.entries(check.details).map(([key, value]) => (
                      <View key={key} style={styles.detailRow}>
                        <Text style={[styles.detailKey, { color: colors.textSecondary }]}>
                          {key}:
                        </Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {String(value)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {checks.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No health checks yet
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
  scoreContainer: {
    padding: 32,
    alignItems: 'center',
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  checksList: {
    padding: 16,
    gap: 12,
  },
  checkCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  checkInfo: {
    flex: 1,
    marginRight: 12,
  },
  checkType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkTime: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  checkScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  checkDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    flex: 1,
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
