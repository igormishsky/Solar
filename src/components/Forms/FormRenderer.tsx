import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Save, Send } from 'lucide-react-native';
import { FormDefinition, FormFieldDefinition } from '@/lib/form-definitions';
import { SignatureCapture } from './SignatureCapture';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import {
  colors,
  spacing,
  radii,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
} from '@/styles';

interface FormRendererProps {
  definition: FormDefinition;
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>, signatureData?: string) => void;
  onSubmit?: (data: Record<string, unknown>, signatureData?: string) => void;
  isRTL: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Helper to get/set nested values
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const result = { ...obj };
  const parts = path.split('.');
  let current = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current[part] = { ...(current[part] as Record<string, unknown>) };
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

export function FormRenderer({
  definition,
  initialData = {},
  onSave,
  onSubmit,
  isRTL,
  disabled = false,
  loading = false,
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [signatureData, setSignatureData] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => setNestedValue(prev, fieldName, value));
    // Clear error when field is edited
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSignatureSave = useCallback((data: string) => {
    setSignatureData(data);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const section of definition.sections) {
      for (const field of section.fields) {
        if (field.required) {
          const value = getNestedValue(formData, field.name);
          if (value === undefined || value === null || value === '') {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [definition, formData]);

  const handleSave = useCallback(() => {
    onSave(formData, signatureData);
  }, [formData, signatureData, onSave]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    onSubmit?.(formData, signatureData);
  }, [formData, signatureData, onSubmit, validateForm]);

  const renderField = (field: FormFieldDefinition): React.ReactNode => {
    const value = getNestedValue(formData, field.name);
    const error = errors[field.name];
    const displayLabel = isRTL && field.labelHe ? field.labelHe : field.label;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                error && styles.inputError,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
              value={value as string || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              keyboardType={
                field.type === 'email'
                  ? 'email-address'
                  : field.type === 'phone'
                    ? 'phone-pad'
                    : 'default'
              }
              editable={!disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'number':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                error && styles.inputError,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
              value={value?.toString() || ''}
              onChangeText={(text) => handleFieldChange(field.name, text ? parseFloat(text) : undefined)}
              keyboardType="numeric"
              editable={!disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'textarea':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                error && styles.inputError,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
              value={value as string || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              multiline
              numberOfLines={4}
              editable={!disabled}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'select':
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.pickerContainer, error && styles.inputError]}>
              <Picker
                selectedValue={value as string || ''}
                onValueChange={(itemValue) => handleFieldChange(field.name, itemValue)}
                enabled={!disabled}
              >
                <Picker.Item label="Select..." value="" />
                {field.options?.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={isRTL && option.labelHe ? option.labelHe : option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'checkbox':
        return (
          <View style={[styles.fieldContainer, styles.checkboxContainer, getFlexDirection(isRTL)]} key={field.name}>
            <Switch
              value={value as boolean || false}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
              disabled={disabled}
            />
            <Text style={[styles.checkboxLabel, isRTL ? { marginRight: spacing.md } : { marginLeft: spacing.md }]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        );

      case 'date':
        const dateValue = value ? new Date(value as string) : new Date();
        return (
          <View style={styles.fieldContainer} key={field.name}>
            <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
              {displayLabel}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, error && styles.inputError]}
              onPress={() => !disabled && setShowDatePicker(field.name)}
            >
              <Calendar size={18} color={colors.gray[500]} />
              <Text style={styles.dateText}>
                {value ? dateValue.toLocaleDateString() : 'Select date...'}
              </Text>
            </TouchableOpacity>
            {showDatePicker === field.name && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(null);
                  if (selectedDate) {
                    handleFieldChange(field.name, selectedDate.toISOString());
                  }
                }}
              />
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'signature':
        return (
          <SignatureCapture
            key={field.name}
            label={field.label}
            labelHe={field.labelHe}
            isRTL={isRTL}
            onSave={handleSignatureSave}
            value={signatureData}
            disabled={disabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {definition.sections.map((section, index) => (
        <Section
          key={index}
          title={isRTL && section.titleHe ? section.titleHe : section.title}
          icon={<View />}
          isRTL={isRTL}
        >
          {section.fields.map(renderField)}
        </Section>
      ))}

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleSave}
          variant="secondary"
          disabled={loading || disabled}
          style={styles.saveButton}
        >
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', gap: spacing.sm }]}>
            <Save size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {isRTL ? 'שמור טיוטה' : 'Save Draft'}
            </Text>
          </View>
        </Button>

        {onSubmit && (
          <Button
            onPress={handleSubmit}
            variant="primary"
            disabled={loading || disabled}
            style={styles.submitButton}
          >
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', gap: spacing.sm }]}>
              <Send size={18} color={colors.white} />
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                {isRTL ? 'שלח לאישור' : 'Submit for Approval'}
              </Text>
            </View>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.gray[800],
  },
  inputError: {
    borderColor: colors.status.error.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  checkboxContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  required: {
    color: colors.status.error.text,
  },
  errorText: {
    color: colors.status.error.text,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  saveButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
