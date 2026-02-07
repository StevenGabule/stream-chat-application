import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Channel,
  MessageList,
  useMessageContext,
  useChannelContext,
} from 'stream-chat-expo';
import type { Channel as ChannelType } from 'stream-chat';
import { chatClient } from '../services/streamClient';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInputCustom } from '../components/MessageInput';
import { colors, fontSize } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

function CustomMessage() {
  const { message, isMyMessage, readBy } = useMessageContext();
  const { channel } = useChannelContext();
  return (
    <MessageBubble
      message={message}
      isMyMessage={isMyMessage}
      readBy={readBy}
      channel={channel}
    />
  );
}

export function ChatScreen({ route, navigation }: Props) {
  const { channelId } = route.params;
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        const ch = chatClient.channel('messaging', channelId);
        await ch.watch();
        setChannel(ch);

        const chData = ch.data as Record<string, unknown> | undefined;
        const name = (chData?.name as string) || channelId;
        navigation.setOptions({ title: name });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load channel.',
        );
      }
    };

    loadChannel();
  }, [channelId, navigation]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Channel channel={channel} MessageSimple={CustomMessage}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <MessageList />
        <MessageInputCustom />
      </KeyboardAvoidingView>
    </Channel>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.xl,
  },
});
