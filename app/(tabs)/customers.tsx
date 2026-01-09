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
import { Search, Plus, User, Users, Phone, Mail, ChevronRight } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCustomers } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone_primary: string;
  email: string | null;
  customer_type: string;
};

export default function CustomersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: customers = [], isLoading } = useCustomers({ query: searchQuery });

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={sharedStyles.card} onPress={() => router.push(`/customer/${item.id}`)}>
      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
          <View style={[sharedStyles.iconContainer, getMarginStart(isRTL, 12)]}>
            <User size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
              {item.first_name} {item.last_name}
            </Text>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }]}>
              <Phone size={14} color={colors.gray[400]} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 4)]}>
                {item.phone_primary}
              </Text>
            </View>
            {item.email && (
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 2 }]}>
                <Mail size={14} color={colors.gray[400]} />
                <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 4)]}>
                  {item.email}
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

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <View style={sharedStyles.pageContent}>
        {/* Search Bar */}
        <View style={[sharedStyles.searchBar, getFlexDirection(isRTL)]}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={[sharedStyles.searchInput, getTextAlign(isRTL)]}
            placeholder={t('customers.searchCustomers')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Customer Button */}
        <TouchableOpacity style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}>
          <Plus size={20} color={colors.white} />
          <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
            {t('customers.addCustomer')}
          </Text>
        </TouchableOpacity>

        {/* Customer List */}
        {customers.length > 0 ? (
          <FlatList
            data={customers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={sharedStyles.emptyState}>
            <Users size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              {t('customers.noCustomers')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
