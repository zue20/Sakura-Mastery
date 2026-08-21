import React, { useCallback } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    ShipporiMincho_600SemiBold: require('./assets/fonts/ShipporiMincho-SemiBold.ttf'),
    ZenMaruGothic_500Medium: require('./assets/fonts/ZenMaruGothic-Medium.ttf'),
    JetBrainsMono_600SemiBold: require('./assets/fonts/JetBrainsMono-SemiBold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']} onLayout={onLayoutRootView}>
        <StatusBar barStyle="dark-content" />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
});