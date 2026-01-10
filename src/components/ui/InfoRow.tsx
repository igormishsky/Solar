import { View, Text, ViewStyle } from 'react-native';
import { sharedStyles, getFlexDirection, getMarginStart } from '@/styles';

type InfoRowProps = {
  icon: React.ReactNode;
  text: string;
  isRTL: boolean;
  style?: ViewStyle;
};

/**
 * A simple row component for displaying icon + text information.
 */
export function InfoRow({ icon, text, isRTL, style }: InfoRowProps) {
  return (
    <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }, style]}>
      {icon}
      <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>{text}</Text>
    </View>
  );
}
