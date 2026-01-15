import { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { Trash2, Check, RotateCcw } from 'lucide-react-native';
import { colors, spacing, radii, sharedStyles, getTextAlign } from '@/styles';

interface SignatureCaptureProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  label?: string;
  labelHe?: string;
  isRTL: boolean;
  value?: string;
  disabled?: boolean;
}

export function SignatureCapture({
  onSave,
  onClear,
  label = 'Signature',
  labelHe,
  isRTL,
  value,
  disabled = false,
}: SignatureCaptureProps) {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [savedSignature, setSavedSignature] = useState<string | null>(value || null);

  const handleEnd = useCallback(() => {
    setIsEmpty(false);
  }, []);

  const handleClear = useCallback(() => {
    signatureRef.current?.clearSignature();
    setIsEmpty(true);
    setSavedSignature(null);
    onClear?.();
  }, [onClear]);

  const handleSave = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  const handleOK = useCallback((signature: string) => {
    // signature is a base64 encoded PNG
    setSavedSignature(signature);
    onSave(signature);
  }, [onSave]);

  const displayLabel = isRTL && labelHe ? labelHe : label;

  if (savedSignature) {
    return (
      <View style={styles.container}>
        <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>{displayLabel}</Text>
        <View style={styles.savedContainer}>
          <Image
            source={{ uri: savedSignature }}
            style={styles.savedSignature}
            resizeMode="contain"
          />
          {!disabled && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
            >
              <RotateCcw size={20} color={colors.gray[600]} />
              <Text style={styles.clearButtonText}>Clear & Re-sign</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>{displayLabel}</Text>
      <View style={styles.signatureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onEnd={handleEnd}
          onOK={handleOK}
          onClear={() => setIsEmpty(true)}
          webStyle={`
            .m-signature-pad {
              box-shadow: none;
              border: none;
              background-color: #fff;
            }
            .m-signature-pad--body {
              border: none;
            }
            .m-signature-pad--footer {
              display: none;
            }
          `}
          backgroundColor={colors.white}
          penColor={colors.gray[800]}
          style={styles.signaturePad}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleClear}
          style={[styles.button, styles.clearActionButton]}
          disabled={isEmpty}
        >
          <Trash2 size={18} color={isEmpty ? colors.gray[300] : colors.gray[600]} />
          <Text style={[styles.buttonText, isEmpty && styles.buttonTextDisabled]}>
            Clear
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.button, styles.saveButton, isEmpty && styles.buttonDisabled]}
          disabled={isEmpty}
        >
          <Check size={18} color={isEmpty ? colors.gray[400] : colors.white} />
          <Text style={[styles.saveButtonText, isEmpty && styles.buttonTextDisabled]}>
            Save Signature
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  signatureContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  signaturePad: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  savedContainer: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  savedSignature: {
    height: 150,
    width: '100%',
    backgroundColor: colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
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
  clearActionButton: {
    backgroundColor: colors.gray[100],
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flex: 2,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[200],
  },
  buttonText: {
    color: colors.gray[600],
    fontWeight: '500',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.gray[400],
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  clearButtonText: {
    color: colors.gray[600],
    fontSize: 14,
  },
});
