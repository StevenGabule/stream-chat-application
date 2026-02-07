import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import type { LocalMessage, Channel } from 'stream-chat';
import { colors, spacing, borderRadius, fontSize } from '../theme';

const REACTION_TYPES = [
  { type: 'like', emoji: '\u2764\uFE0F' },
  { type: 'haha', emoji: '\uD83D\uDE02' },
  { type: 'wow', emoji: '\uD83D\uDE2E' },
  { type: 'sad', emoji: '\uD83D\uDE22' },
  { type: 'angry', emoji: '\uD83D\uDE21' },
];

interface MessageBubbleProps {
  message: LocalMessage;
  isMyMessage: boolean;
  readBy?: number | boolean;
  channel?: Channel;
}

function getStatusLabel(
  message: LocalMessage,
  readBy: number | boolean | undefined,
): string | null {
  if (message.status === 'sending') return 'Sending...';
  if (message.status === 'failed') return 'Failed';
  if (typeof readBy === 'number' && readBy > 0) return 'Read';
  if (message.status === 'received') return 'Sent';
  return null;
}

export function MessageBubble({
  message,
  isMyMessage,
  readBy,
  channel,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const bubbleStyle = isMyMessage ? styles.myBubble : styles.otherBubble;
  const textStyle = isMyMessage ? styles.myText : styles.otherText;
  const statusLabel = isMyMessage ? getStatusLabel(message, readBy) : null;

  const imageAttachments = (message.attachments ?? []).filter(
    (a) => a.type === 'image' && (a.image_url || a.thumb_url),
  );

  const reactionCounts = message.reaction_counts ?? {};
  const ownReactionTypes = (message.own_reactions ?? []).map((r) => r.type);
  const hasReactions = Object.keys(reactionCounts).length > 0;

  const handleToggleReaction = async (reactionType: string) => {
    if (!channel) return;
    setShowReactionPicker(false);

    if (ownReactionTypes.includes(reactionType)) {
      await channel.deleteReaction(message.id, reactionType);
    } else {
      await channel.sendReaction(message.id, { type: reactionType });
    }
  };

  return (
    <View
      style={[styles.container, isMyMessage ? styles.myRow : styles.otherRow]}
    >
      {!isMyMessage && (
        <Text style={styles.senderName}>{message.user?.name}</Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => setShowReactionPicker(true)}
        delayLongPress={300}
      >
        <View style={[styles.bubble, bubbleStyle]}>
          {imageAttachments.map((att, idx) => (
            <Image
              key={idx}
              source={{ uri: att.image_url || att.thumb_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
          {message.text ? (
            <Text style={textStyle}>{message.text}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {hasReactions && (
        <View style={styles.reactionsRow}>
          {REACTION_TYPES.filter((r) => reactionCounts[r.type]).map((r) => (
            <TouchableOpacity
              key={r.type}
              style={[
                styles.reactionBadge,
                ownReactionTypes.includes(r.type) && styles.reactionBadgeOwn,
              ]}
              onPress={() => handleToggleReaction(r.type)}
            >
              <Text style={styles.reactionText}>
                {r.emoji} {reactionCounts[r.type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : ''}
        </Text>
        {statusLabel && (
          <Text
            style={[
              styles.status,
              message.status === 'failed' && styles.statusFailed,
            ]}
          >
            {' '}
            {statusLabel}
          </Text>
        )}
      </View>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <Pressable
          style={styles.reactionOverlay}
          onPress={() => setShowReactionPicker(false)}
        >
          <View style={styles.reactionPicker}>
            {REACTION_TYPES.map((r) => (
              <TouchableOpacity
                key={r.type}
                style={[
                  styles.reactionOption,
                  ownReactionTypes.includes(r.type) &&
                    styles.reactionOptionSelected,
                ]}
                onPress={() => handleToggleReaction(r.type)}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    maxWidth: '80%',
  },
  myRow: {
    alignSelf: 'flex-end',
  },
  otherRow: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.sm,
  },
  otherBubble: {
    backgroundColor: colors.backgroundMuted,
    borderBottomLeftRadius: spacing.sm,
  },
  myText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.lg,
  },
  otherText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  reactionBadge: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundMuted,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  reactionBadgeOwn: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  reactionText: {
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginHorizontal: spacing.md,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  status: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  statusFailed: {
    color: colors.error,
  },
  reactionOverlay: {
    flex: 1,
    backgroundColor: colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: spacing.sm,
  },
  reactionOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionOptionSelected: {
    backgroundColor: colors.primaryFaint,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
