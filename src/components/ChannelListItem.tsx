import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Channel } from 'stream-chat';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface ChannelListItemProps {
  channel: Channel;
  latestMessagePreview?: {
    messageObject?: { text?: string };
  };
  unread?: number;
  onSelect: () => void;
}

export function ChannelListItem({
  channel,
  latestMessagePreview,
  unread,
  onSelect,
}: ChannelListItemProps) {
  const channelData = channel.data as Record<string, unknown> | undefined;
  const displayName =
    (channelData?.name as string) || channel.id || 'Unnamed Channel';
  const previewText =
    latestMessagePreview?.messageObject?.text || 'No messages yet';

  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {(unread ?? 0) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {previewText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.xxl,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.md,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  preview: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
});
