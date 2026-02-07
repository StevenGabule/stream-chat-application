import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMessageComposer } from 'stream-chat-expo';
import { colors, spacing, borderRadius, fontSize } from '../theme';

const TYPING_DEBOUNCE_MS = 1000;

interface PendingImage {
  uri: string;
  name: string;
  type: string;
}

export function MessageInputCustom() {
  const insets = useSafeAreaInsets();
  const composer = useMessageComposer();
  const channel = composer.channel;
  const [text, setText] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);

      if (value.length > 0) {
        channel.keystroke();
      } else {
        channel.stopTyping();
      }

      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        channel.stopTyping();
      }, TYPING_DEBOUNCE_MS);
    },
    [channel],
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName || `image_${Date.now()}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';

    setPendingImage({ uri: asset.uri, name: fileName, type: mimeType });
  };

  const handleRemoveImage = () => {
    setPendingImage(null);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) return;
    if (!channel) return;

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    channel.stopTyping();

    setIsSending(true);
    try {
      const attachments: Array<{
        type: string;
        image_url: string;
        fallback?: string;
      }> = [];

      if (pendingImage) {
        const response = await channel.sendImage(
          pendingImage.uri,
          pendingImage.name,
          pendingImage.type,
        );
        if (response.file) {
          attachments.push({
            type: 'image',
            image_url: response.file,
            fallback: pendingImage.name,
          });
        }
      }

      setText('');
      setPendingImage(null);

      await channel.sendMessage({
        text: trimmed || '',
        attachments,
      });
    } finally {
      setIsSending(false);
    }
  };

  const canSend = text.trim().length > 0 || pendingImage !== null;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {pendingImage && (
        <View style={styles.previewRow}>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: pendingImage.uri }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
            >
              <Text style={styles.removeText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.container}>
        <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
          <Text style={styles.attachText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend || isSending}
        >
          {isSending ? (
            <ActivityIndicator color={colors.textOnPrimary} size="small" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  attachText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  sendButton: {
    marginLeft: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  sendText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: fontSize.lg,
  },
  previewRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm + 2,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
