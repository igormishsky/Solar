import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react-native';
import { colors, spacing, radii, sharedStyles, getTextAlign } from '@/styles';
import { useRegisterMonitoringSystem, useUnregisterMonitoringSystem, MonitoringConfig } from '@/hooks/useMonitoring';

interface MonitoringConfigProps {
  projectId: string;
  projectName: string;
  currentConfig?: {
    provider: string;
    systemId: string;
  } | null;
  onConfigSaved?: (config: MonitoringConfig) => void;
  onConfigRemoved?: () => void;
  isRTL?: boolean;
}

export function MonitoringConfigPanel({
  projectId,
  projectName,
  currentConfig,
  onConfigSaved,
  onConfigRemoved,
  isRTL = false,
}: MonitoringConfigProps) {
  const [provider, setProvider] = useState<'solaredge' | 'enphase'>(
    (currentConfig?.provider as 'solaredge' | 'enphase') || 'solaredge'
  );
  const [apiKey, setApiKey] = useState('');
  const [siteId, setSiteId] = useState(currentConfig?.systemId || '');
  const [isEditing, setIsEditing] = useState(!currentConfig);

  const registerMutation = useRegisterMonitoringSystem();
  const unregisterMutation = useUnregisterMonitoringSystem();

  const handleSave = async () => {
    if (!apiKey.trim() || !siteId.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        systemId: projectId,
        provider,
        apiKey,
        siteId,
      });

      const config: MonitoringConfig = { provider, apiKey, siteId };
      onConfigSaved?.(config);
      setIsEditing(false);
      Alert.alert('Success', 'Monitoring configuration saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save monitoring configuration');
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Remove Monitoring',
      'Are you sure you want to remove monitoring configuration for this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unregisterMutation.mutateAsync(projectId);
              onConfigRemoved?.();
              setIsEditing(true);
              setSiteId('');
              setApiKey('');
              Alert.alert('Success', 'Monitoring configuration removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove monitoring configuration');
            }
          },
        },
      ]
    );
  };

  const isLoading = registerMutation.isPending || unregisterMutation.isPending;

  if (!isEditing && currentConfig) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Link size={20} color={colors.primary} />
          <Text style={[styles.title, getTextAlign(isRTL)]}>Monitoring Connected</Text>
        </View>

        <View style={styles.configInfo}>
          <View style={styles.infoRow}>
            <CheckCircle size={16} color={colors.green[500]} />
            <Text style={styles.infoText}>
              Provider: <Text style={styles.infoBold}>{currentConfig.provider.toUpperCase()}</Text>
            </Text>
          </View>
          <View style={styles.infoRow}>
            <CheckCircle size={16} color={colors.green[500]} />
            <Text style={styles.infoText}>
              Site ID: <Text style={styles.infoBold}>{currentConfig.systemId}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Configuration</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={handleRemove}
            disabled={isLoading}
          >
            <Trash2 size={16} color={colors.red[600]} />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link size={20} color={colors.gray[600]} />
        <Text style={[styles.title, getTextAlign(isRTL)]}>Configure Monitoring</Text>
      </View>

      <Text style={styles.description}>
        Connect this project to a real-time monitoring service to track solar production data.
      </Text>

      <View style={styles.formGroup}>
        <Text style={sharedStyles.label}>Monitoring Provider</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={provider}
            onValueChange={(value) => setProvider(value)}
            style={styles.picker}
          >
            <Picker.Item label="SolarEdge" value="solaredge" />
            <Picker.Item label="Enphase" value="enphase" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={sharedStyles.label}>API Key *</Text>
        <TextInput
          style={sharedStyles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={`Enter ${provider === 'solaredge' ? 'SolarEdge' : 'Enphase'} API key`}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.helpText}>
          {provider === 'solaredge'
            ? 'Get your API key from the SolarEdge monitoring portal under Admin > Site Access > API Access'
            : 'Get your API key from the Enphase Developer portal at developer.enphase.com'}
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={sharedStyles.label}>{provider === 'solaredge' ? 'Site ID' : 'System ID'} *</Text>
        <TextInput
          style={sharedStyles.input}
          value={siteId}
          onChangeText={setSiteId}
          placeholder={`Enter ${provider === 'solaredge' ? 'site' : 'system'} ID`}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <Text style={styles.helpText}>
          {provider === 'solaredge'
            ? 'Find your Site ID in the SolarEdge monitoring portal URL or Site Details'
            : 'Find your System ID in the Enphase Enlighten app or web portal'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        {currentConfig && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Save size={16} color={colors.white} />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.warningBox}>
        <AlertCircle size={16} color={colors.orange[600]} />
        <Text style={styles.warningText}>
          API credentials are stored securely on the server. Real-time monitoring data will replace
          simulated data once configured.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  description: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  configInfo: {
    backgroundColor: colors.green[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  infoBold: {
    fontWeight: '600',
    color: colors.gray[900],
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  helpText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    color: colors.gray[700],
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.gray[100],
    flex: 1,
  },
  editButtonText: {
    color: colors.gray[700],
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  removeButtonText: {
    color: colors.red[600],
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.orange[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.orange[800],
    lineHeight: 18,
  },
});
