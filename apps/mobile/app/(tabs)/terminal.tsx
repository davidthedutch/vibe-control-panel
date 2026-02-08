import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import type { PromptEntry } from '@vibe/shared';

interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export default function TerminalScreen() {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: '0',
      type: 'output',
      content: 'Vibe Control Panel Terminal v1.0.0\nType a command or prompt...',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const colors = useThemeColors();

  useEffect(() => {
    // Scroll to bottom when new entries are added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], content: string) => {
    const entry: TerminalEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, entry]);
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const prompt = input.trim();
    setInput('');
    setLoading(true);

    // Add input to terminal
    addEntry('input', `> ${prompt}`);

    try {
      // Check for built-in commands
      if (prompt.toLowerCase() === 'clear') {
        setEntries([]);
        setLoading(false);
        return;
      }

      if (prompt.toLowerCase() === 'help') {
        addEntry(
          'output',
          'Available commands:\n' +
            '  clear          - Clear terminal\n' +
            '  help           - Show this help\n' +
            '  history        - Show prompt history\n' +
            '  status         - Show system status\n' +
            '\nOr type any prompt to log it to the database.'
        );
        setLoading(false);
        return;
      }

      if (prompt.toLowerCase() === 'history') {
        const { data, error } = await supabase
          .from('prompt_entries')
          .select('prompt_text, created_at, status')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          const historyText = data
            .map(
              (entry, i) =>
                `${i + 1}. [${entry.status}] ${entry.prompt_text.substring(0, 50)}...`
            )
            .join('\n');
          addEntry('output', 'Recent prompts:\n' + historyText);
        } else {
          addEntry('output', 'No prompt history found.');
        }
        setLoading(false);
        return;
      }

      if (prompt.toLowerCase() === 'status') {
        const { count: componentsCount } = await supabase
          .from('components')
          .select('*', { count: 'exact', head: true });

        const { count: usersCount } = await supabase
          .from('site_users')
          .select('*', { count: 'exact', head: true });

        const { data: healthData } = await supabase
          .from('health_checks')
          .select('status')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        addEntry(
          'output',
          `System Status:\n` +
            `  Components: ${componentsCount || 0}\n` +
            `  Users: ${usersCount || 0}\n` +
            `  Health: ${healthData?.status || 'unknown'}\n` +
            `  Connected: ${supabase ? 'Yes' : 'No'}`
        );
        setLoading(false);
        return;
      }

      // Save to database as a prompt entry
      const { error } = await supabase.from('prompt_entries').insert({
        prompt_text: prompt,
        prompt_type: 'feature',
        ai_model: 'mobile-terminal',
        session_tool: 'mobile-app',
        components_affected: [],
        files_changed: [],
        tokens_used: [],
        result: 'logged',
        status: 'success',
        impact_notes: 'Logged from mobile terminal',
      });

      if (error) throw error;

      addEntry('output', `Prompt logged successfully.\nPrompt: "${prompt}"`);
    } catch (error: any) {
      addEntry('error', `Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryContainer}>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              [{formatTime(entry.timestamp)}]
            </Text>
            <Text
              style={[
                styles.entryText,
                {
                  color:
                    entry.type === 'error'
                      ? colors.error
                      : entry.type === 'input'
                      ? colors.primary
                      : colors.text,
                  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                },
              ]}
            >
              {entry.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Processing...
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder="Enter command or prompt..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          editable={!loading}
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: loading ? colors.surfaceSecondary : colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading || !input.trim()}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={loading ? colors.textSecondary : colors.background}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  entryContainer: {
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 10,
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
