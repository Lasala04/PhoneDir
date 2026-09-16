import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0D0D0D',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: '#0D0D0D',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="phone/add"
          options={{
            title: 'Add Phone',
          }}
        />
        <Stack.Screen
          name="phone/[id]"
          options={{
            title: 'Phone Details',
          }}
        />
        <Stack.Screen
          name="phone/edit/[id]"
          options={{
            title: 'Edit Phone',
          }}
        />
      </Stack>
    </>
  );
}
