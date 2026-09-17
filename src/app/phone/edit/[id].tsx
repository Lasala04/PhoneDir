import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { Phone } from '@/types/phone';
import { getPhone, updatePhone } from '@/services/api';
import PhoneForm, { PhoneFormValues } from '@/components/PhoneForm';
import InstrumentLoader from '@/components/InstrumentLoader';
import { colors, font, space } from '@/constants/instrument';

export default function EditPhoneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        try {
          const data = await getPhone(Number(id));
          if (isMounted) setPhone(data);
        } catch {
          if (isMounted) {
            // Alert handled by falling through to not-found UI
            setPhone(null);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [id])
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'LOADING…' }} />
        <InstrumentLoader label="LOADING RECORD" />
      </>
    );
  }

  if (!phone) {
    return (
      <>
        <Stack.Screen options={{ title: 'ERROR' }} />
        <View style={styles.center}>
          <Text style={styles.centerText}>FAILED TO LOAD RECORD</Text>
        </View>
      </>
    );
  }

  const handleUpdate = (values: PhoneFormValues, imageUri?: string) =>
    updatePhone({ id: Number(id), ...values }, imageUri);

  return (
    <>
      <Stack.Screen options={{ title: `EDIT · #${phone.id}` }} />
      <PhoneForm
        initial={phone}
        submitLabel="SAVE CHANGES"
        successMessage="Record updated."
        onSubmit={handleUpdate}
        onSuccess={() => router.back()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
  },
  centerText: {
    color: colors.textMute,
    fontFamily: font.monoMed,
    fontSize: 12,
    letterSpacing: 2,
  },
});
