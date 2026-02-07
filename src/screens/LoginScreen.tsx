import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useChatContext } from '../context/ChatContext';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const { connectUser, isConnecting } = useChatContext();

  const handleLogin = async () => {
    const trimmedId = userId.trim();
    if (!trimmedId) {
      Alert.alert('Error', 'Please enter a user ID.');
      return;
    }

    const sanitized = trimmedId.replace(/[^a-zA-Z0-9_\-@]/g, '_');

    try {
      await connectUser(sanitized, userName.trim() || sanitized);
      navigation.replace('ChannelList');
    } catch (error) {
      Alert.alert(
        'Connection Error',
        error instanceof Error ? error.message : 'Failed to connect.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Stream Chat</Text>
        <Text style={styles.subtitle}>Sign in to start chatting</Text>

        <TextInput
          style={styles.input}
          placeholder="User ID"
          placeholderTextColor={colors.textTertiary}
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name (optional)"
          placeholderTextColor={colors.textTertiary}
          value={userName}
          onChangeText={setUserName}
        />

        <TouchableOpacity
          style={[styles.button, isConnecting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>Connect</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    height: 48,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  button: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
});
