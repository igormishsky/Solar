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
import { Search, Plus, FolderKanban, ChevronRight, Calendar } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { getStatusColor } from '@/lib/utils';

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data - will be replaced with React Query
  const projects: Array<{
    id: string;
    name: string;
    status: string;
    current_stage: string;
    customer_name?: string;
    start_date?: string;
  }> = [];

  const renderProjectItem = ({ item }: { item: typeof projects[0] }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#fff7ed',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isRTL ? 0 : 12,
              marginLeft: isRTL ? 12 : 0,
            }}
          >
            <FolderKanban size={24} color="#f97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1f2937',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {item.name}
            </Text>
            {item.customer_name && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                  marginTop: 2,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {item.customer_name}
              </Text>
            )}
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                marginTop: 8,
                gap: 8,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  backgroundColor: getStatusColor(item.status).includes('green')
                    ? '#ecfdf5'
                    : getStatusColor(item.status).includes('blue')
                    ? '#eff6ff'
                    : getStatusColor(item.status).includes('yellow')
                    ? '#fffbeb'
                    : '#f3f4f6',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: getStatusColor(item.status).includes('green')
                      ? '#059669'
                      : getStatusColor(item.status).includes('blue')
                      ? '#2563eb'
                      : getStatusColor(item.status).includes('yellow')
                      ? '#d97706'
                      : '#6b7280',
                  }}
                >
                  {t(`projects.statuses.${item.status}`)}
                </Text>
              </View>
              {item.start_date && (
                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: 'center',
                  }}
                >
                  <Calendar size={12} color="#9ca3af" />
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      marginLeft: isRTL ? 0 : 4,
                      marginRight: isRTL ? 4 : 0,
                    }}
                  >
                    {item.start_date}
                  </Text>
                </View>
              )}
            </View>
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
            placeholder={t('projects.searchProjects')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Project Button */}
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
            {t('projects.addProject')}
          </Text>
        </TouchableOpacity>

        {/* Project List */}
        {projects.length > 0 ? (
          <FlatList
            data={projects}
            renderItem={renderProjectItem}
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
            <FolderKanban size={48} color="#d1d5db" />
            <Text
              style={{
                fontSize: 16,
                color: '#9ca3af',
                marginTop: 16,
              }}
            >
              {t('projects.noProjects')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
