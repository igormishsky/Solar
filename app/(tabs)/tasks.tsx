import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, ClipboardList, ChevronRight, Clock, AlertCircle } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { getPriorityColor } from '@/lib/utils';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data - will be replaced with React Query
  const tasks: Array<{
    id: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    due_date?: string;
  }> = [];

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#fef2f2';
      case 'high':
        return '#fff7ed';
      case 'medium':
        return '#eff6ff';
      default:
        return '#f3f4f6';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  const renderTaskItem = ({ item }: { item: typeof tasks[0] }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityTextColor(item.priority),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                flex: 1,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {item.title}
            </Text>
          </View>
          {item.description && (
            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 8,
                textAlign: isRTL ? 'right' : 'left',
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: getPriorityBgColor(item.priority),
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: getPriorityTextColor(item.priority),
                }}
              >
                {t(`tasks.priorities.${item.priority}`)}
              </Text>
            </View>
            {item.due_date && (
              <View
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                }}
              >
                <Clock size={12} color="#9ca3af" />
                <Text
                  style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    marginLeft: isRTL ? 0 : 4,
                    marginRight: isRTL ? 4 : 0,
                  }}
                >
                  {item.due_date}
                </Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight
          size={20}
          color="#9ca3af"
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['bottom']}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={{
              flex: 1,
              padding: 12,
              fontSize: 16,
              textAlign: isRTL ? 'right' : 'left',
            }}
            placeholder={t('tasks.searchTasks')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Task Button */}
        <TouchableOpacity
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f97316',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <Plus size={20} color="#fff" />
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: isRTL ? 0 : 8,
              marginRight: isRTL ? 8 : 0,
            }}
          >
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
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ClipboardList size={48} color="#d1d5db" />
            <Text
              style={{
                fontSize: 16,
                color: '#9ca3af',
                marginTop: 16,
              }}
            >
              {t('tasks.noTasks')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
