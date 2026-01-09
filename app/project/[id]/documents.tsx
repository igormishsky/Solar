import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import {
  ArrowLeft,
  FileText,
  Upload,
  Trash2,
  Download,
  File,
  Image,
  FileSpreadsheet,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useProjectDocuments, useUploadDocument, useDeleteDocument } from '@/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

type Document = {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return <File size={24} color={colors.gray[400]} />;
  if (fileType.includes('image')) return <Image size={24} color={colors.status.info.text} />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
    return <FileSpreadsheet size={24} color={colors.status.success.text} />;
  }
  if (fileType.includes('pdf')) return <FileText size={24} color={colors.status.error.text} />;
  return <File size={24} color={colors.gray[400]} />;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ProjectDocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const user = useAuthStore((state) => state.user);
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading } = useProjectDocuments(id);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      await uploadDocument.mutateAsync({
        file: {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name,
        },
        name: file.name,
        projectId: id,
        uploadedBy: user?.id,
      });

      Alert.alert(t('common.success'), 'Document uploaded successfully');
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.general'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (docId: string, docName: string) => {
    Alert.alert(
      t('common.confirm'),
      `Delete "${docName}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument.mutateAsync(docId);
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          },
        },
      ]
    );
  };

  const renderDocumentItem = (doc: Document) => (
    <View
      key={doc.id}
      style={[
        sharedStyles.card,
        { marginBottom: 12 },
      ]}
    >
      <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: colors.gray[100],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {getFileIcon(doc.file_type)}
          </View>
          <View style={[{ flex: 1 }, getMarginStart(isRTL, 12)]}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL)]} numberOfLines={1}>
              {doc.name}
            </Text>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', gap: 8, marginTop: 4 }]}>
              {doc.file_size && (
                <Text style={sharedStyles.caption}>
                  {formatFileSize(doc.file_size)}
                </Text>
              )}
              <Text style={sharedStyles.caption}>
                {new Date(doc.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <View style={[getFlexDirection(isRTL), { gap: 8 }]}>
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: colors.status.info.bg,
              borderRadius: 8,
            }}
            onPress={() => {
              // In a real app, this would open the document
              Alert.alert('Download', `Opening ${doc.name}`);
            }}
          >
            <Download size={20} color={colors.status.info.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: colors.status.error.bg,
              borderRadius: 8,
            }}
            onPress={() => handleDelete(doc.id, doc.name)}
          >
            <Trash2 size={20} color={colors.status.error.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      {/* Header */}
      <View
        style={[
          getFlexDirection(isRTL),
          {
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: 'center',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[getFlexDirection(isRTL), { alignItems: 'center' }]}
        >
          <ArrowLeft
            size={24}
            color={colors.white}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
          <Text style={[{ color: colors.white, fontSize: 18, fontWeight: '600' }, getMarginStart(isRTL, 8)]}>
            {t('nav.documents')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Upload Button */}
        <TouchableOpacity
          style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Upload size={20} color={colors.white} />
              <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
                {t('common.upload')} {t('nav.documents')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Documents List */}
        {isLoading ? (
          <View style={sharedStyles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : documents.length > 0 ? (
          documents.map(renderDocumentItem)
        ) : (
          <View style={sharedStyles.emptyState}>
            <FileText size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              No documents yet
            </Text>
            <Text style={[sharedStyles.caption, { marginTop: 8, textAlign: 'center' }]}>
              Upload documents related to this project
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
