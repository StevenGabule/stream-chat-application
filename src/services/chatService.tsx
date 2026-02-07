import { Channel } from 'stream-chat';
import { chatClient } from './streamClient';

export const chatService = {
  /**
   * Connect a user to Stream Chat with an auto-generated token.
   */
  async connectUser(userId: string, userName?: string) {
    const token = chatClient.devToken(userId);

    await chatClient.connectUser(
      {
        id: userId,
        name: userName || userId,
        image: `https://getstream.io/random_png/?name=${userName || userId}`,
      },
      token,
    );

    return chatClient.user;
  },

  /**
   * Disconnect the current user from Stream Chat.
   */
  async disconnectUser() {
    await chatClient.disconnectUser();
  },

  /**
   * Create or get a messaging channel between members.
   */
  async createChannel(
    channelId: string,
    name: string,
    members: string[],
  ): Promise<Channel> {
    const channel = chatClient.channel('messaging', channelId, {
      members,
      ...(({ name } as Record<string, unknown>)),
    });

    await channel.watch();
    return channel;
  },

  /**
   * Create or get a 1-on-1 direct message channel.
   * Uses distinct:true so if a DM already exists between the two users
   * the existing channel is returned instead of creating a duplicate.
   */
  async createDirectChannel(
    currentUserId: string,
    otherUserId: string,
  ): Promise<Channel> {
    // Ensure the other user exists before creating the channel
    await chatClient.upsertUser({
      id: otherUserId,
      name: otherUserId,
      image: `https://getstream.io/random_png/?name=${otherUserId}`,
    });

    const channel = chatClient.channel('messaging', {
      members: [currentUserId, otherUserId],
    });

    await channel.watch();
    return channel;
  },

  /**
   * Send a message to a channel.
   */
  async sendMessage(channel: Channel, text: string) {
    await channel.sendMessage({ text });
  },
};
