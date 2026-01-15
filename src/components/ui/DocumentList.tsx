import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { FileText, Download, Trash2, Image, File, FileSpreadsheet } from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';
import { Tables } from '@/types/database.types';

type Document = Tables<'documents'> & {
  uploaded_by_user?: {
    email: string;
    full_name: string | null;
  } | null;
};

interface DocumentListProps {
  documents: Document[];
  isRTL: boolean;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  canDelete?: boolean;
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;

  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function DocumentList({
  documents,
  isRTL,
  onDownload,
  onDelete,
  isLoading = false,
  emptyMessage = 'No documents found',
  canDelete = false,
}: DocumentListProps) {
  const handleDownload = async (document: Document) => {
    if (onDownload) {
      onDownload(document);
    } else if (document.file_url) {
      try {
        const supported = await Linking.canOpenURL(document.file_url);
        if (supported) {
          await Linking.openURL(document.file_url);
        } else {
          Alert.alert('Error', 'Cannot open this file');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open file');
      }
    }
  };

  const handleDelete = (document: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(document),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[sharedStyles.emptyState, { paddingVertical: spacing.xl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (documents.length === 0) {
    return (
      <View style={[sharedStyles.emptyState, { paddingVertical: spacing.xl }]}>
        <FileText size={48} color={colors.gray[300]} />
        <Text style={sharedStyles.emptyStateText}>{emptyMessage}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Document }) => {
    const IconComponent = getFileIcon(item.file_type);
    const uploaderName = item.uploaded_by_user?.full_name || item.uploaded_by_user?.email || 'Unknown';

    return (
      <View
        style={[
          sharedStyles.listItem,
          getFlexDirection(isRTL),
          { alignItems: 'center' },
        ]}
      >
        {/* File Type Icon */}
        <View
          style={[
            sharedStyles.iconContainerSmall,
            { backgroundColor: colors.gray[100] },
          ]}
        >
          <IconComponent size={16} color={colors.gray[600]} />
        </View>

        {/* Document Info */}
        <View style={[{ flex: 1 }, getMarginStart(isRTL, spacing.md)]}>
          <Text
            style={[
              sharedStyles.title,
              getTextAlign(isRTL),
              { fontSize: typography.fontSize.md },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
            {formatFileSize(item.file_size)} - {formatDate(item.created_at)}
          </Text>
          <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
            Uploaded by {uploaderName}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[getFlexDirection(isRTL), { gap: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => handleDownload(item)}
            style={{
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: colors.status.info.bg,
            }}
          >
            <Download size={18} color={colors.status.info.text} />
          </TouchableOpacity>

          {canDelete && onDelete && (
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={{
                padding: spacing.sm,
                borderRadius: 8,
                backgroundColor: colors.status.error.bg,
              }}
            >
              <Trash2 size={18} color={colors.status.error.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={documents}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.gray[100] }} />}
    />
  );
}
