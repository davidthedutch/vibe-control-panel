import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import type { Component } from '@vibe/shared';

const statusColors = {
  planned: '#6b7280',
  in_progress: '#3b82f6',
  working: '#10b981',
  broken: '#ef4444',
  deprecated: '#f59e0b',
  needs_review: '#8b5cf6',
};

const statusIcons = {
  planned: 'clock-outline',
  in_progress: 'progress-clock',
  working: 'check-circle',
  broken: 'alert-circle',
  deprecated: 'archive',
  needs_review: 'eye',
};

export default function ComponentsScreen() {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    filterComponents();
  }, [searchQuery, components]);

  const fetchComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setComponents((data || []) as Component[]);
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterComponents = () => {
    if (!searchQuery.trim()) {
      setFilteredComponents(components);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = components.filter(
      (component) =>
        component.name.toLowerCase().includes(query) ||
        component.category?.toLowerCase().includes(query) ||
        component.type?.toLowerCase().includes(query)
    );
    setFilteredComponents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComponents();
  };

  const getStatusIcon = (status: Component['status']) => {
    return statusIcons[status] || 'help-circle';
  };

  const renderComponent = ({ item }: { item: Component }) => (
    <TouchableOpacity
      style={[styles.componentCard, {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }]}
    >
      <View style={styles.componentHeader}>
        <View style={styles.componentInfo}>
          <Text style={[styles.componentName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.componentPath, { color: colors.textSecondary }]}>
            {item.filePath}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[item.status] + '20' },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={14}
            color={statusColors[item.status]}
          />
          <Text
            style={[
              styles.statusText,
              { color: statusColors[item.status] },
            ]}
          >
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text
          style={[styles.componentDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      <View style={styles.componentFooter}>
        <View style={styles.tag}>
          <MaterialCommunityIcons
            name="cube-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>
            {item.type}
          </Text>
        </View>

        {item.category && (
          <View style={styles.tag}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Search components..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredComponents}
        renderItem={renderComponent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="cube-off-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No components found' : 'No components yet'}
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 16,
    borderWidth: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 28,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  componentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  componentInfo: {
    flex: 1,
    marginRight: 12,
  },
  componentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  componentPath: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  componentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  componentFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    textTransform: 'capitalize',
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
