import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Upload, File, Image, X, CheckCircle } from 'lucide-react-native';
import {
  colors,
  spacing,
  radii,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface FileUploadProps {
  onFileSelect: (file: FileInfo) => void;
  onUploadComplete?: (response: unknown) => void;
  onError?: (error: string) => void;
  isRTL: boolean;
  accept?: 'all' | 'images' | 'documents';
  maxSizeMB?: number;
  label?: string;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
}

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onFileSelect,
  onUploadComplete,
  onError,
  isRTL,
  accept = 'all',
  maxSizeMB = 10,
  label = 'Upload File',
  disabled = false,
  uploading = false,
  uploadProgress,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDocumentPick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: accept === 'images' ? ALLOWED_IMAGE_TYPES : accept === 'documents' ? ALLOWED_DOCUMENT_TYPES : '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      // Validate file size
      if (file.size && file.size > maxSizeBytes) {
        onError?.(`File size exceeds ${maxSizeMB}MB limit`);
        Alert.alert('Error', `File size exceeds ${maxSizeMB}MB limit`);
        return;
      }

      const fileInfo: FileInfo = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
        size: file.size,
      };

      setSelectedFile(fileInfo);
      onFileSelect(fileInfo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pick file';
      onError?.(message);
    }
  }, [accept, maxSizeBytes, maxSizeMB, onFileSelect, onError]);

  const handleImagePick = useCallback(async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // Validate file size
      if (asset.fileSize && asset.fileSize > maxSizeBytes) {
        onError?.(`File size exceeds ${maxSizeMB}MB limit`);
        Alert.alert('Error', `File size exceeds ${maxSizeMB}MB limit`);
        return;
      }

      const fileInfo: FileInfo = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
        size: asset.fileSize,
      };

      setSelectedFile(fileInfo);
      onFileSelect(fileInfo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pick image';
      onError?.(message);
    }
  }, [maxSizeBytes, maxSizeMB, onFileSelect, onError]);

  const handlePick = useCallback(() => {
    if (accept === 'images') {
      handleImagePick();
    } else {
      handleDocumentPick();
    }
  }, [accept, handleImagePick, handleDocumentPick]);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const getAcceptLabel = () => {
    switch (accept) {
      case 'images':
        return 'JPG, PNG, GIF';
      case 'documents':
        return 'PDF, DOC, XLS';
      default:
        return 'PDF, Images, Documents';
    }
  };

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Label */}
      {label && (
        <Text style={[sharedStyles.label, getTextAlign(isRTL)]}>
          {label}
        </Text>
      )}

      {/* Upload Area */}
      {!selectedFile ? (
        <TouchableOpacity
          onPress={handlePick}
          disabled={disabled || uploading}
          style={[
            {
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: disabled ? colors.gray[200] : colors.gray[300],
              borderRadius: radii.lg,
              padding: spacing.xl,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: disabled ? colors.gray[50] : colors.white,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={[sharedStyles.iconContainer, { marginBottom: spacing.md }]}>
            {accept === 'images' ? (
              <Image size={24} color={colors.primary} />
            ) : (
              <Upload size={24} color={colors.primary} />
            )}
          </View>
          <Text style={[sharedStyles.title, { textAlign: 'center', marginBottom: spacing.xs }]}>
            Tap to select a file
          </Text>
          <Text style={[sharedStyles.caption, { textAlign: 'center' }]}>
            {getAcceptLabel()} (Max {maxSizeMB}MB)
          </Text>
        </TouchableOpacity>
      ) : (
        /* Selected File Display */
        <View
          style={[
            sharedStyles.card,
            getFlexDirection(isRTL),
            { alignItems: 'center', marginBottom: 0 },
          ]}
        >
          {/* File Icon */}
          <View
            style={[
              sharedStyles.iconContainerSmall,
              { backgroundColor: uploading ? colors.status.info.bg : colors.status.success.bg },
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.status.info.text} />
            ) : (
              <CheckCircle size={16} color={colors.status.success.text} />
            )}
          </View>

          {/* File Info */}
          <View style={[{ flex: 1 }, getMarginStart(isRTL, spacing.md)]}>
            <Text
              style={[sharedStyles.title, { fontSize: typography.fontSize.md }]}
              numberOfLines={1}
            >
              {selectedFile.name}
            </Text>
            <Text style={sharedStyles.caption}>
              {selectedFile.size ? formatFileSize(selectedFile.size) : 'Unknown size'}
              {uploadProgress !== undefined && uploading && ` - ${uploadProgress}%`}
            </Text>
          </View>

          {/* Remove Button */}
          {!uploading && (
            <TouchableOpacity
              onPress={clearSelection}
              style={{
                padding: spacing.sm,
                borderRadius: radii.full,
                backgroundColor: colors.gray[100],
              }}
            >
              <X size={16} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Upload Progress Bar */}
      {uploading && uploadProgress !== undefined && (
        <View
          style={{
            marginTop: spacing.sm,
            height: 4,
            backgroundColor: colors.gray[200],
            borderRadius: radii.full,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${uploadProgress}%`,
              backgroundColor: colors.primary,
              borderRadius: radii.full,
            }}
          />
        </View>
      )}
    </View>
  );
}
