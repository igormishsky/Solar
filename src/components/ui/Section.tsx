import { View, Text, ViewStyle } from 'react-native';
import { sharedStyles, colors, getFlexDirection, getMarginStart } from '@/styles';

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isRTL: boolean;
  style?: ViewStyle;
};

/**
 * A reusable section component for detail screens.
 * Displays a card with a title, icon, and content.
 */
export function Section({ title, icon, children, isRTL, style }: SectionProps) {
  return (
    <View style={[sharedStyles.card, { marginBottom: 16 }, style]}>
      <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: 16 }]}>
        {icon}
        <Text style={[sharedStyles.title, getMarginStart(isRTL, 8), { fontSize: 18 }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
