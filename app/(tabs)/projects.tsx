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
import { useProjects } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getStatusColors,
} from '@/styles';

type Project = {
  id: string;
  name: string;
  status: string;
  current_stage: string;
  customer_name?: string;
  start_date?: string;
};

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: projects = [], isLoading } = useProjects();

  const renderProjectItem = ({ item }: { item: Project }) => {
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity style={sharedStyles.card}>
        <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
            <View style={[sharedStyles.iconContainer, getMarginStart(isRTL, 12)]}>
              <FolderKanban size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                {item.name}
              </Text>
              {item.customer_name && (
                <Text style={[sharedStyles.subtitle, { marginTop: 2 }, getTextAlign(isRTL)]}>
                  {item.customer_name}
                </Text>
              )}
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 8, gap: 8 }]}>
                <View style={[sharedStyles.badge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[sharedStyles.badgeText, { color: statusColors.text }]}>
                    {t(`projects.statuses.${item.status}`)}
                  </Text>
                </View>
                {item.start_date && (
                  <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
                    <Calendar size={12} color={colors.gray[400]} />
                    <Text style={[sharedStyles.caption, getMarginStart(isRTL, 4)]}>
                      {item.start_date}
                    </Text>
                  </View>
                )}
              </View>
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
            placeholder={t('projects.searchProjects')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Project Button */}
        <TouchableOpacity style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}>
          <Plus size={20} color={colors.white} />
          <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
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
          <View style={sharedStyles.emptyState}>
            <FolderKanban size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              {t('projects.noProjects')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
