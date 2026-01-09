import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ClipboardList, ChevronRight, Clock } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useTasks } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getPriorityColors,
} from '@/styles';

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
};

export default function TasksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: tasks = [], isLoading } = useTasks({ query: searchQuery });

  const renderTaskItem = ({ item }: { item: Task }) => {
    const priorityColors = getPriorityColors(item.priority);

    return (
      <TouchableOpacity
        style={[
          sharedStyles.card,
          { borderLeftWidth: 4, borderLeftColor: priorityColors.text },
        ]}
        onPress={() => router.push(`/task/${item.id}`)}
      >
        <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: 4 }]}>
              <Text style={[sharedStyles.title, { flex: 1 }, getTextAlign(isRTL)]}>
                {item.title}
              </Text>
            </View>
            {item.description && (
              <Text
                style={[sharedStyles.subtitle, { marginBottom: 8 }, getTextAlign(isRTL)]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', gap: 12 }]}>
              <View style={[sharedStyles.badge, { backgroundColor: priorityColors.bg }]}>
                <Text style={[sharedStyles.badgeText, { color: priorityColors.text }]}>
                  {t(`tasks.priorities.${item.priority}`)}
                </Text>
              </View>
              {item.due_date && (
                <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
                  <Clock size={12} color={colors.gray[400]} />
                  <Text style={[sharedStyles.caption, getMarginStart(isRTL, 4)]}>
                    {item.due_date}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight
            size={20}
            color={colors.gray[400]}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <View style={sharedStyles.pageContent}>
        {/* Search Bar */}
        <View style={[sharedStyles.searchBar, getFlexDirection(isRTL)]}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={[sharedStyles.searchInput, getTextAlign(isRTL)]}
            placeholder={t('tasks.searchTasks')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}>
          <Plus size={20} color={colors.white} />
          <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
            {t('tasks.addTask')}
          </Text>
        </TouchableOpacity>

        {/* Task List */}
        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={sharedStyles.emptyState}>
            <ClipboardList size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              {t('tasks.noTasks')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
