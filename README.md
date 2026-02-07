# Stream Chat Application

A real-time chat application built with React Native, Expo, TypeScript, and Stream Chat SDK.

## Tech Stack

- **React Native** with **Expo SDK 54**
- **TypeScript**
- **stream-chat-expo** v8.12.4 (Stream Chat React Native SDK)
- **React Navigation** (Native Stack)
- **expo-image-picker** for image attachments

## Project Structure

```
src/
  services/
    streamClient.tsx    # StreamChat singleton instance
    chatService.tsx     # User connection, channel creation, messaging
  context/
    ChatContext.tsx      # Global auth/user state (React Context)
  components/
    MessageBubble.tsx   # Message display with reactions & status
    MessageInput.tsx    # Custom input with image picker & typing events
    ChannelListItem.tsx # Channel preview with unread badge
  screens/
    LoginScreen.tsx     # User ID + display name login
    ChannelListScreen.tsx # Channel list with new DM modal
    ChatScreen.tsx      # Message list + input
  theme.tsx             # Centralized colors, spacing, typography
App.tsx                 # Root providers + navigation
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- A [Stream Chat](https://getstream.io/chat/) account

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stream Dashboard

1. Go to [Stream Dashboard](https://dashboard.getstream.io/)
2. Open your app (API Key: ``)
3. Navigate to **Chat > Overview**
4. Enable **"Disable Auth Checks"** (required for dev tokens)
5. Enable **"Disable Permissions Checks"** (optional, simplifies development)

### 3. Run the App

```bash
# Start Expo dev server
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 4. Testing with Multiple Users

To test conversations, run two emulator instances:

1. Start the app on the first emulator, log in as `user1`
2. Open a second emulator (Android: `emulator -avd <AVD_NAME>`)
3. Start the app there, log in as `user2`
4. From either user, create a new conversation using the + button and enter the other user's ID

## Features

### Authentication

- Users log in with a User ID and optional Display Name
- Dev tokens are generated client-side via `chatClient.devToken()`
- Connection status is displayed during login

### Channel List

- Displays all channels the user is a member of
- Sorted by most recent message
- Shows channel name, last message preview, and unread count badge
- FAB button (+) opens a modal to start a new 1-on-1 conversation
- Logout button to disconnect and return to login

### Chat Screen

- Real-time message list with auto-scroll
- Sender name displayed for other users' messages
- Timestamps on every message
- Message status indicators (Sending... / Sent / Read / Failed)
- Typing events sent on keystroke with 1-second debounce

### Image Attachments

- Tap the + button to pick an image from the device gallery
- Image preview shown before sending with an X to remove
- Images uploaded via `channel.sendImage()` and sent as message attachments
- Received images displayed inline in message bubbles

### Message Reactions

- Long-press any message to open the reaction picker
- 5 reaction types: heart, haha, wow, sad, angry
- Tap a reaction badge to toggle your own reaction
- Own reactions highlighted with a blue border
- Reaction counts displayed below the message

### Custom Theming

- All visual tokens centralized in `src/theme.tsx`
- Single-file brand customization: change `colors.primary` to rebrand the entire app
- Theme applied to both custom components and Stream SDK internals via `streamChatTheme`

## Design Decisions

### Dev Tokens Instead of Server Tokens

The Stream Chat JS client's `createToken()` uses the Node.js `jsonwebtoken` library, which is not available in React Native. Instead, the app uses `chatClient.devToken()` for development. **For production, tokens should be generated on a backend server.**

### Custom Message Input Over SDK Default

The SDK's built-in `<MessageInput />` component was replaced with a fully custom implementation (`MessageInputCustom`) for better control over layout, image picking, and typing events. The custom input is rendered directly inside a `KeyboardAvoidingView` rather than through the SDK's wrapper.

### Channel Data Type Assertions

The Stream Chat TypeScript types do not include `name` on `ChannelData` by default. The app uses `channel.data as Record<string, unknown>` to access channel names safely without extending the SDK types.

### User Upsert Before Channel Creation

When creating a new DM, the app calls `chatClient.upsertUser()` for the target user before creating the channel. This ensures the user exists in Stream's system, avoiding "user not found" errors.

### Distinct Channels for DMs

1-on-1 channels are created without an explicit ID, which triggers Stream's `distinct: true` behavior automatically. If a channel between two users already exists, it is returned instead of creating a duplicate.

### Local Text State in MessageInput

Rather than using the SDK's `useMessageInputContext()` (which doesn't expose `text`/`setText` in v8), the input manages its own text state with `useState` and sends messages directly via `channel.sendMessage()`.

## Assumptions

- **Development environment only**: Auth checks are disabled in Stream Dashboard. Production apps must generate JWT tokens on a backend server.
- **User IDs are alphanumeric**: The login screen sanitizes input to `[a-zA-Z0-9_-]` characters, replacing invalid characters with underscores.
- **1-on-1 messaging only**: The new conversation modal creates direct channels between two users. Group channels are not exposed in the UI but could be added.
- **No persistent local storage**: User sessions are not persisted. Users must log in again after closing the app.
- **Image-only attachments**: The attachment picker supports images only (no files, video, or audio).

## Implementation Notes

- The app uses `StreamChat.getInstance(API_KEY)` as a singleton - the client is shared across all services and components.
- The `<Chat>` provider from `stream-chat-expo` wraps the entire navigation tree, making SDK hooks available in all screens.
- `useMessageComposer()` is used (not `useMessageComposerContext`) - this is the correct export in `stream-chat-expo` v8.
- Message types use `LocalMessage` from `stream-chat` (not `MessageType` which doesn't exist in v8).
- The theme file exports `as const` objects for full TypeScript inference of literal values.
- Reaction toggling uses `channel.sendReaction()` / `channel.deleteReaction()` based on whether the user already reacted with that type.
