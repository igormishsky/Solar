import { View, Text, TextInput, TextInputProps } from 'react-native';
import { sharedStyles, colors, getTextAlign } from '@/styles';

type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  isRTL: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  inputProps?: Partial<TextInputProps>;
};

/**
 * A reusable form field component for display and edit modes.
 * Supports both read-only display and editable input states.
 */
export function Field({
  label,
  value,
  isRTL,
  editable = false,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  inputProps,
}: FieldProps) {
  const displayValue = value ?? '';

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginBottom: 4 }]}>
        {label}
      </Text>
      {editable ? (
        <TextInput
          style={[
            sharedStyles.searchInput,
            {
              backgroundColor: colors.gray[50],
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.gray[200],
              padding: 12,
              ...(multiline && { minHeight: 100, textAlignVertical: 'top' }),
            },
            getTextAlign(isRTL),
          ]}
          value={String(displayValue)}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...inputProps}
        />
      ) : (
        <Text
          style={[
            sharedStyles.subtitle,
            getTextAlign(isRTL),
            { fontSize: 15, color: colors.gray[700] },
          ]}
        >
          {displayValue || '-'}
        </Text>
      )}
    </View>
  );
}
