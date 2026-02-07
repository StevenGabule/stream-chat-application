import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OverlayProvider, Chat } from 'stream-chat-expo';

import { ChatProvider } from './src/context/ChatContext';
import { chatClient } from './src/services/streamClient';
import { colors, streamChatTheme } from './src/theme';

import { LoginScreen } from './src/screens/LoginScreen';
import { ChannelListScreen } from './src/screens/ChannelListScreen';
import { ChatScreen } from './src/screens/ChatScreen';

export type RootStackParamList = {
  Login: undefined;
  ChannelList: undefined;
  Chat: { channelId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ChatProvider>
          <OverlayProvider>
            <Chat client={chatClient} style={streamChatTheme}>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Login"
                  screenOptions={{
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.textOnPrimary,
                    headerTitleStyle: { fontWeight: '600' },
                  }}
                >
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ChannelList"
                    component={ChannelListScreen}
                    options={{ title: 'Channels', headerBackVisible: false }}
                  />
                  <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{ title: 'Chat' }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </Chat>
          </OverlayProvider>
        </ChatProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
