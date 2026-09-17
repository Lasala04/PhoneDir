import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import BootScreen from '@/components/BootScreen';
import {
  useFonts,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';
import { colors, font } from '@/constants/instrument';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const [loaded, error] = useFonts({
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontFamily: font.monoSemi,
            fontSize: 13,
            color: colors.text,
          },
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="phone/add" options={{ title: 'NEW · RECORD' }} />
        <Stack.Screen name="phone/[id]" options={{ title: 'RECORD' }} />
        <Stack.Screen name="phone/edit/[id]" options={{ title: 'EDIT · RECORD' }} />
      </Stack>
      {!booted && <BootScreen onDone={() => setBooted(true)} />}
    </>
  );
}
