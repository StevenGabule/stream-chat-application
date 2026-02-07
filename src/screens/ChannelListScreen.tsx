import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChannelList } from 'stream-chat-expo';
import type { ChannelSort } from 'stream-chat';
import { useChatContext } from '../context/ChatContext';
import { chatService } from '../services/chatService';
import { ChannelListItem } from '../components/ChannelListItem';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChannelList'>;

const sort: ChannelSort = { last_message_at: -1 };

export function ChannelListScreen({ navigation }: Props) {
  const { currentUser, disconnectUser } = useChatContext();
  const [showNewChat, setShowNewChat] = useState(false);
  const [otherUserId, setOtherUserId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filters = {
    type: 'messaging',
    members: { $in: [currentUser?.id ?? ''] },
  };

  const handleLogout = async () => {
    await disconnectUser();
    navigation.replace('Login');
  };

  const handleCreateDM = async () => {
    const trimmed = otherUserId.trim().replace(/[^a-zA-Z0-9_\-@]/g, '_');
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a user ID.');
      return;
    }
    if (trimmed === currentUser?.id) {
      Alert.alert('Error', 'You cannot start a chat with yourself.');
      return;
    }

    setIsCreating(true);
    try {
      const channel = await chatService.createDirectChannel(
        currentUser!.id,
        trimmed,
      );
      setShowNewChat(false);
      setOtherUserId('');
      navigation.navigate('Chat', { channelId: channel.id! });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create channel.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Channels</Text>
          <Text style={styles.headerSubtitle}>
            Signed in as {currentUser?.name || currentUser?.id}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ChannelList
        filters={filters}
        sort={sort}
        onSelect={(channel) => {
          navigation.navigate('Chat', { channelId: channel.id! });
        }}
        Preview={({ channel, latestMessagePreview, unread }) => (
          <ChannelListItem
            channel={channel}
            latestMessagePreview={latestMessagePreview}
            unread={unread}
            onSelect={() =>
              navigation.navigate('Chat', { channelId: channel.id! })
            }
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewChat(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChat}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewChat(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowNewChat(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <Text style={styles.modalSubtitle}>
                Enter the user ID of the person you want to chat with.
                If a conversation already exists, it will be opened.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="User ID"
                placeholderTextColor={colors.textTertiary}
                value={otherUserId}
                onChangeText={setOtherUserId}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowNewChat(false);
                    setOtherUserId('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    isCreating && styles.startButtonDisabled,
                  ]}
                  onPress={handleCreateDM}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator color={colors.textOnPrimary} size="small" />
                  ) : (
                    <Text style={styles.startButtonText}>Start Chat</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: spacing.xl - 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.hero,
    fontWeight: '400',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  modalInput: {
    height: 48,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.sm + 2,
    backgroundColor: colors.backgroundMuted,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  startButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.sm + 2,
    backgroundColor: colors.primary,
  },
  startButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  startButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
});
