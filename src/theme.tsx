/**
 * Centralized theme for the Stream Chat app.
 * Change colors here to rebrand the entire app.
 */

export const colors = {
  // Brand
  primary: '#005FFF',
  primaryLight: '#B0C4FF',
  primaryFaint: '#DBEAFE',

  // Backgrounds
  background: '#FFF',
  backgroundSecondary: '#F5F7FB',
  backgroundInput: '#F5F5F5',
  backgroundMuted: '#F0F0F0',

  // Text
  textPrimary: '#000',
  textSecondary: '#666',
  textTertiary: '#999',
  textMuted: '#333',
  textOnPrimary: '#FFF',

  // Borders
  border: '#E0E0E0',

  // Semantic
  error: '#FF3B30',
  success: '#34C759',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.3)',
} as const;

export const spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  pill: 20,
  full: 28,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 20,
  title: 22,
  hero: 28,
} as const;

/**
 * Stream Chat SDK theme overrides.
 * Applied via the `style` prop on the <Chat> component.
 */
export const streamChatTheme = {
  channelListMessenger: {
    flatList: {
      backgroundColor: colors.background,
    },
  },
  messageList: {
    container: {
      backgroundColor: colors.background,
    },
  },
  messageSimple: {
    container: {},
  },
  typingIndicator: {
    container: {
      backgroundColor: colors.background,
    },
    text: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
    },
  },
};
