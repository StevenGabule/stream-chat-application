import { StreamChat } from 'stream-chat';

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

// Client-only singleton — no API secret (jsonwebtoken doesn't run in RN).
// Uses dev tokens instead; enable "Disable Auth Checks" in the Stream dashboard.
const chatClient = StreamChat.getInstance(API_KEY);

export { chatClient, API_KEY };
